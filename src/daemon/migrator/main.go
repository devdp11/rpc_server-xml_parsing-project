package main

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"
	/* "github.com/streadway/amqp" */
)

const (
	dbUser      = "is"
	dbPassword  = "is"
	dbName      = "is"
	dbHost      = "db-xml"
	port		= "5432"
)

func connectdatabase() *sql.DB {
	connStr := fmt.Sprintf("user=%s password=%s dbname=%s host=%s port=%s sslmode=disable",
		dbUser, dbPassword, dbName, dbHost, port)

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("Error connecting with XML Database:", err)
	} else {
		fmt.Println("Connection sucessfull with XML Database")
	}

	err = db.Ping()
	if err != nil {
		log.Fatal("Error pinging XML Database:", err)
	}

	return db
}

func main() {
	db := connectdatabase()
	defer db.Close()
}