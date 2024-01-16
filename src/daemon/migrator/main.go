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
	apiCountriesCreate = "http://api-entities:8080/countries/add"
)

type Message struct {
	FileName  string    `json:"file_name"`
	CreatedOn time.Time `json:"created_on"`
	UpdatedOn time.Time `json:"updated_on"`
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

	conn, ch := connectrabbitmq()
	defer conn.Close()
	defer ch.Close()

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
			// Execute a lógica de migração aqui utilizando a API api-entities e a conexão do banco de dados db
			migrateData(db, message)
		}
	}
}

func main() {
	db := connectdatabase()
	defer db.Close()

	conn, ch := connectrabbitmq()
	defer conn.Close()
	defer ch.Close()

	consumemessage(ch, db)
}

func migrateData(db *sql.DB, message Message) {
    // Query the database to retrieve XML data based on the filename
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

    // Process the retrieved XML data
    //log.Printf("Retrieved XML data for filename %s: %s", message.FileName, xmlData)

    // Parse the XML data
    var countries Data
    if err := xml.Unmarshal([]byte(xmlData), &countries); err != nil {
        log.Printf("Error parsing XML data: %s", err)
        return
    }

    // Check if there are countries in the parsed data
    if len(countries.Countries) == 0 {
        log.Printf("No countries found in the XML data for filename: %s", message.FileName)
        return
    }

    // Iterate over countries and insert each one using the API
    for _, country := range countries.Countries {
        log.Printf("Processing country: %+v", country)

        // Fazer chamada à API para inserir país
        err := insertCountryUsingAPI(country.Name)
        if err != nil {
            log.Printf("Error inserting country %s: %s", country.Name, err)
        } else {
            log.Printf("Successfully inserted country: %s", country.Name)
        }
    }
}



// Define a struct to match the XML structure
type Data struct {
    XMLName   xml.Name   `xml:"Data"`
    Countries []Country `xml:"Countries>Country"`
}

type Country struct {
    ID   string `xml:"id,attr"`
    Name string `xml:"name,attr"`
}



func insertCountryUsingAPI(country string) error {
	client := resty.New()

	resp, err := client.R().
		SetHeader("Content-Type", "application/json").
		SetBody(map[string]string{
			"country_name": country,
		}).
		Post(apiCountriesCreate)

	if err != nil {
		return fmt.Errorf("Error sending country to API: %s", err)
	}

	if resp.StatusCode() != 201 {
		return fmt.Errorf("Error sending country to API. Status code: %d", resp.StatusCode())
	}

	fmt.Printf("Country sent to API. Name: %s\n", country)
	return nil
}