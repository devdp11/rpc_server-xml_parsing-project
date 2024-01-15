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

const (
	dbUser      = "is"
	dbPassword  = "is"
	dbName      = "is"
	dbHost      = "db-xml"
	port        = "5432"
	rabbitMQURL = "amqp://is:is@rabbitmq:5672/is"
	queueName   = "queue"
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

	consumemessage(ch)

	return conn, ch
}

func consumemessage(ch *amqp.Channel) {
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
		}
	}
}

func main() {
	db := connectdatabase()
	defer db.Close()
}