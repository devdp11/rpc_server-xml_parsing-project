package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"time"

	_ "github.com/lib/pq"
	"github.com/streadway/amqp"
)

func sayHelloWorld() {
	fmt.Println("Hello, World!!")
}

func checkErr(err error) {
	if err != nil {
		log.Fatal(err)
	}
}

const (
	dbUser      = "is"
	dbPassword  = "is"
	dbName      = "is"
	dbHost      = "db-xml"
	port		= "5432"
	rabbitMQURL = "amqp://is:is@rabbitmq:5672/is"
	queueName   = "queue"
)

func connectDB() *sql.DB {
	connStr := fmt.Sprintf("user=%s password=%s dbname=%s host=%s port=%s sslmode=disable",
		dbUser, dbPassword, dbName, dbHost, port)

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("Error establishing connection with database:", err)
	}

	err = db.Ping()
	if err != nil {
		log.Fatal("Error pinging database:", err)
	}

	return db
}

func sendToBroker(fileName string, createdOn time.Time, updatedOn time.Time) {
	conn, err := amqp.Dial(rabbitMQURL)
	if err != nil {
		log.Fatalf("Error connecting with RabbitMQ: %s", err)
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("Erro opening channel: %s", err)
	}
	defer ch.Close()

	q, err := ch.QueueDeclare(
		queueName,
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		log.Fatalf("Erro declaring queue: %s", err)
	}

	message := map[string]interface{}{
		"file_name":   fileName,
		"created_on":  createdOn,
		"updated_on":  updatedOn,
	}

	jsonData, err := json.Marshal(message)
	if err != nil {
		log.Printf("Error converting message to JSON: %s\n", err)
		return
	}

	body := string(jsonData)
	err = ch.Publish(
		"",
		q.Name,
		false,
		false,
		amqp.Publishing{
			DeliveryMode: amqp.Persistent,
			ContentType:  "application/json",
			Body:         []byte(body),
		})
	if err != nil {
		log.Fatalf("Error publishing message: %s", err)
	}

	fmt.Println("Mensage sent to RabbitMQ sucessfully!")
}

func checkXMLFiles(db *sql.DB) {
	fmt.Println("Verifying new XML...")

	ticker := time.NewTicker(60 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			query := ` SELECT file_name, created_on, updated_on FROM imported_documents WHERE (created_on > $1 OR updated_on > $1) AND deleted_on IS NULL `

			sixtySecondsAgo := time.Now().Add(-60 * time.Second)

			rows, err := db.Query(query, sixtySecondsAgo)
			if err != nil {
				log.Fatal("Erro ao executar a consulta:", err)
			}

			for rows.Next() {
				var fileName string
				var createdOn time.Time
				var updatedOn time.Time
				err := rows.Scan(&fileName, &createdOn, &updatedOn)
				if err != nil {
					log.Fatal("Error on select query:", err)
				}

				fmt.Printf("XML found: \nNome: %s\nCreated: %s\nUpdated: %s\n", fileName, createdOn, updatedOn)

				sendToBroker(fileName, createdOn, updatedOn)
			}

			if err := rows.Err(); err != nil {
				log.Fatal("Error during result interaction:", err)
			}

			rows.Close()
		}
	}
}

func main() {
	db := connectDB()
	sayHelloWorld()
	checkXMLFiles(db)
	defer db.Close()
}