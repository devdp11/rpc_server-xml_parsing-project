package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"time"
	"encoding/xml"

	_ "github.com/lib/pq"
	"github.com/streadway/amqp"
	"github.com/go-resty/resty/v2"
)

const (
	dbUser         = "is"
	dbPassword     = "is"
	dbName         = "is"
	dbHost         = "db-xml"
	port           = "5432"
	rabbitMQURL    = "amqp://is:is@rabbitmq:5672/is"
	queueName      = "queue"
	apicountries = "http://api-entities:8080/countries/add/"
	apibrands = "http://api-entities:8080/brands/add/"
	apimodels = "http://api-entities:8080/models/add/"
	apistyles = "http://api-entities:8080/styles/add/"
)

type Message struct {
	FileName  string    `json:"file_name"`
	CreatedOn time.Time `json:"created_on"`
	UpdatedOn time.Time `json:"updated_on"`
}

type Data struct {
    XMLName   xml.Name   `xml:"Data"`
    Countries []Country  `xml:"Countries>Country"`
    Brands    []Brand    `xml:"Brands>Brand"`
    Styles    []Style    `xml:"Styles>Style"`
}

type Country struct {
	ID   string `xml:"id,attr"`
    Name string `xml:"name,attr"`
}

type Brand struct {
    ID         string   `xml:"id,attr"`
    Name       string   `xml:"name,attr"`
    CountryRef string   `xml:"country_ref,attr"`
    Models     []Model  `xml:"Models>Model"`
}

type Model struct {
    ID       string `xml:"id,attr"`
    Name     string `xml:"name,attr"`
}

type Style struct {
	ID   string `xml:"id,attr"`
    Name string `xml:"name,attr"`
}

func connectdatabase() *sql.DB {
	connStr := fmt.Sprintf("user=%s password=%s dbname=%s host=%s port=%s sslmode=disable",
		dbUser, dbPassword, dbName, dbHost, port)

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("Error connecting with XML Database:", err)
	} else {
		fmt.Println("Connection successful with XML Database")
	}

	err = db.Ping()
	if err != nil {
		log.Fatal("Error pinging XML Database:", err)
	}

	return db
}

func connectrabbitmq() (*amqp.Connection, *amqp.Channel) {
	conn, err := amqp.Dial(rabbitMQURL)
	if err != nil {
		log.Fatalf("Error connecting with RabbitMQ: %s", err)
	} else {
		fmt.Println("Connection successful with RabbitMQ")
	}

	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("Error opening channel: %s", err)
	}

	return conn, ch
}

func consumemessage(ch *amqp.Channel, db *sql.DB) {
	q, err := ch.QueueDeclare(
		queueName,
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		log.Fatalf("Error declaring Queue: %s", err)
	}

	msgs, err := ch.Consume(
		q.Name,
		"",
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		log.Fatalf("Error consuming messages: %s", err)
	}

	for msg := range msgs {
		var message Message
		err := json.Unmarshal(msg.Body, &message)
		if err != nil {
			log.Printf("Error decoding JSON message: %s\n", err)
		} else {
			fmt.Printf("\nReceived queued filename: %+v\n", message.FileName)
			migratedata(db, message)
		}
	}
}

func migratedata(db *sql.DB, message Message) {
    query := "SELECT xml FROM imported_documents WHERE file_name = $1"
    var xmlData string
    err := db.QueryRow(query, message.FileName).Scan(&xmlData)
    if err == sql.ErrNoRows {
        log.Printf("No record found for filename: %s", message.FileName)
        return
    } else if err != nil {
        log.Printf("Error querying database: %s", err)
        return
    }

    var countries Data
	if err := parseXMLData(xmlData, &countries, "Countries"); err != nil {
		return
	}

	if len(countries.Countries) == 0 {
        log.Printf("No countries found in the XML data for filename: %s", message.FileName)
        return
    }

	countryMap := make(map[string]string)
	for _, country := range countries.Countries {
		log.Printf("Processing country: %+v", country)

		err := insertcountry(country.Name)
		if err != nil {
			log.Printf("Error inserting country %s: %s", country.Name, err)
		}

		countryMap[country.ID] = country.Name
	}

	var brands Data
	if err := parseXMLData(xmlData, &brands, "Brands"); err != nil {
		return
	}

	if len(brands.Brands) == 0 {
        log.Printf("No brands found in the XML data for filename: %s", message.FileName)
        return
    }

	for _, brand := range brands.Brands {
		countryName, exists := countryMap[brand.CountryRef]
		if !exists {
			log.Printf("Country with ID %s not found for brand %s", brand.CountryRef, brand.Name)
			continue
		}
	
		log.Printf("Processing brand: %+v, CountryName: %s", brand, countryName)
	
		err := insertbrand(brand.Name, countryName)
		if err != nil {
			log.Printf("Error inserting brand %s: %s", brand.Name, err)
		}
	
		for _, model := range brand.Models {
			log.Printf("Processing model: %+v, BrandName: %s", model, brand.Name)
	
			err := insertModel(brand.Name, model.Name)
			if err != nil {
				log.Printf("Error inserting model %s: %s", model.Name, err)
			}
		}
	}

	var styles Data
	if err := parseXMLData(xmlData, &styles, "Styles"); err != nil {
		return
	}

	if len(styles.Styles) == 0 {
        log.Printf("No styles found in the XML data for filename: %s", message.FileName)
        return
    }

	for _, style := range styles.Styles {
		log.Printf("Processing style: %+v", style)

		err := insertstyle(style.Name)
		if err != nil {
			log.Printf("Error inserting style %s: %s", style.Name, err)
		}
	}
}

func parseXMLData(xmlData string, target interface{}, sectionName string) error {
    if err := xml.Unmarshal([]byte(xmlData), target); err != nil {
        log.Printf("Error parsing %s data: %s", sectionName, err)
        return err
    }
    return nil
}

func main() {
	db := connectdatabase()
	defer db.Close()

	conn, ch := connectrabbitmq()
	defer conn.Close()
	defer ch.Close()

	consumemessage(ch, db)
}

func insertcountry(country string) error {
	client := resty.New()

	url := fmt.Sprintf("%s%s", apicountries, country)

	resp, err := client.R().
		SetHeader("Content-Type", "application/json").
		SetBody(map[string]string{
			"country_name": country,
		}).
		Post(url)

	if err != nil {
		return fmt.Errorf("Error sending country to API: %s", err)
	}

	if resp.StatusCode() != 201 {
		return fmt.Errorf("Error sending country to API. Status code: %d", resp.StatusCode())
	}

	fmt.Printf("Country sent to API. Name: %s\n", country)
	return nil
}

func insertbrand(brandName, countryName string) error {
	client := resty.New()

	url := fmt.Sprintf("%s%s/%s", apibrands, brandName, countryName)

	resp, err := client.R().
		SetHeader("Content-Type", "application/json").
		SetBody(map[string]string{
			"brand_name":  brandName,
			"country_name": countryName,
		}).
		Post(url)

	if err != nil {
		return fmt.Errorf("Error sending brand to API: %s", err)
	}

	if resp.StatusCode() != 201 {
		return fmt.Errorf("Error sending brand to API. Status code: %d", resp.StatusCode())
	}

	fmt.Printf("Brand sent to API. Name: %s, Country: %s\n", brandName, countryName)
	return nil
}

func insertModel(brandName, modelName string) error {
	client := resty.New()

	url := fmt.Sprintf("%s%s/%s", apimodels, brandName, modelName)

	resp, err := client.R().
		SetHeader("Content-Type", "application/json").
		SetBody(map[string]string{
			"brand_name":  brandName,
			"model_name": modelName,
		}).
		Post(url)

	if err != nil {
		return fmt.Errorf("Error sending model to API: %s", err)
	}

	if resp.StatusCode() != 201 {
		return fmt.Errorf("Error sending model to API. Status code: %d", resp.StatusCode())
	}

	fmt.Printf("Model sent to API. Name: %s, Brand: %s\n", modelName, brandName)
	return nil
}

func insertstyle(style string) error {
	client := resty.New()

	url := fmt.Sprintf("%s%s", apistyles, style)

	resp, err := client.R().
		SetHeader("Content-Type", "application/json").
		SetBody(map[string]string{
			"style_name": style,
		}).
		Post(url)

	if err != nil {
		return fmt.Errorf("Error sending style to API: %s", err)
	}

	if resp.StatusCode() != 201 {
		return fmt.Errorf("Error sending style to API. Status code: %d", resp.StatusCode())
	}

	fmt.Printf("Style sent to API. Name: %s\n", style)
	return nil
}
