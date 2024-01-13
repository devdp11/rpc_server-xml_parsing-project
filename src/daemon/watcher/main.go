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

// Database information
const (
	dbUser      = "is"
	dbPassword  = "is"
	dbName      = "is"
	dbHost      = "db-xml"
	port        = "5432"
	rabbitMQURL = "amqp://is:is@rabbitmq:5672/is"
	queueName   = "queue"
)

// Database connection
func connectDatabase() *sql.DB {
	connStr := fmt.Sprintf("user=%s password=%s dbname=%s host=%s port=%s sslmode=disable",
		dbUser, dbPassword, dbName, dbHost, port)

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("Error connecting with Database:", err)
	}

	if err = db.Ping(); err != nil {
		log.Fatal("Error pinging database:", err)
	} else {
		fmt.Println("Connection sucessfull with Database")
	}

	return db
}

// RabbitMQ queue message structure
type Message struct {
	FileName  string    `json:"file_name"`
	CreatedOn time.Time `json:"created_on"`
	UpdatedOn time.Time `json:"updated_on"`
}

// RabbitMQ connection and queue message function
func sendMessage(ch *amqp.Channel, fileName string, createdOn time.Time, updatedOn time.Time) {
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

	msg := Message{
		FileName:  fileName,
		CreatedOn: createdOn,
		UpdatedOn: updatedOn,
	}

	jsonData, err := json.Marshal(msg)
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

	fmt.Println("Message sent to RabbitMQ successfully!")
}

// Function to check for new XML files in the database
func checkFiles(db *sql.DB, ch *amqp.Channel) {
	fmt.Println("Verifying new XML...")

	ticker := time.NewTicker(60 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			query := `SELECT file_name, created_on, updated_on FROM imported_documents WHERE (created_on > $1 OR updated_on > $1) AND deleted_on IS NULL`

			sixtySecondsAgo := time.Now().Add(-60 * time.Second)

			rows, err := db.Query(query, sixtySecondsAgo)
			if err != nil {
				log.Fatal("Error executing the Query:", err)
			}

			for rows.Next() {
				var fileName string
				var createdOn time.Time
				var updatedOn time.Time
				if err := rows.Scan(&fileName, &createdOn, &updatedOn); err != nil {
					log.Fatal("Error on select Query:", err)
				}

				fmt.Printf("XML found:\nName: %s\nCreated: %s\nUpdated: %s\n", fileName, createdOn, updatedOn)

				sendMessage(ch, fileName, createdOn, updatedOn)
			}

			if err := rows.Err(); err != nil {
				log.Fatal("Error during result interaction:", err)
			}

			rows.Close()
		}
	}
}

func main() {
	db := connectDatabase()
	defer db.Close()

	conn, err := amqp.Dial(rabbitMQURL)
	if err != nil {
		log.Fatalf("Error connecting with RabbitMQ: %s", err)
	} else {
		fmt.Println("Connection sucessfull with RabbitMQ")
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("Error: %s", err)
	}
	defer ch.Close()

	checkFiles(db, ch)
}