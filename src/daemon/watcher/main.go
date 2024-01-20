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

var ch *amqp.Channel

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

func connectrabbitmq() (*amqp.Connection, *amqp.Channel, error) {
    conn, err := amqp.Dial(rabbitMQURL)
    if err != nil {
        return nil, nil, fmt.Errorf("Error connecting with RabbitMQ: %s", err)
    }

    fmt.Println("Connection successful with RabbitMQ")

    ch, err := conn.Channel()
    if err != nil {
        return nil, nil, fmt.Errorf("Error opening channel: %s", err)
    }

    return conn, ch, nil
}

func sendmessage(queueName, fileName string, createdOn time.Time, updatedOn time.Time) {
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

    message := map[string]interface{}{
        "file_name":  fileName,
        "created_on": createdOn,
        "updated_on": updatedOn,
    }

    jsonData, err := json.Marshal(message)
    if err != nil {
        log.Printf("Error converting to JSON: %s\n", err)
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

    fmt.Printf("Message sent to RabbitMQ successfully! Queue: %s\n", queueName)
}

func checkfiles(db *sql.DB) {
    fmt.Println("Verifying new XML...")

    ticker := time.NewTicker(60 * time.Second)
    defer ticker.Stop()

    for {
        select {
        case <-ticker.C:
            query := ` SELECT file_name, created_on, updated_on FROM imported_documents WHERE (created_on > $1 OR updated_on > $1) AND deleted_on IS NULL `

            timer := time.Now().Add(-60 * time.Second)

            rows, err := db.Query(query, timer)
            if err != nil {
                log.Fatal("Error executing search:", err)
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

                sendmessage("MIGRATE_DATA", fileName, createdOn, updatedOn)
                
                time.Sleep(5 * time.Second)
                
                sendmessage("UPDATE_GIS", fileName, createdOn, updatedOn)
            }

            if err := rows.Err(); err != nil {
                log.Fatal("Error during result interaction:", err)
            }

            rows.Close()
        }
    }
}

func main() {
	db := connectdatabase()

	conn, channel, err := connectrabbitmq()
	checkErr(err)
	defer conn.Close()
	defer channel.Close()

	ch = channel

	checkfiles(db)
	defer db.Close()
}