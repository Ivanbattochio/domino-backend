import express from "express"
import cors from "cors"
import "dotenv/config"
import mongodb from "mongodb"

const app = express()

var database = undefined

const dbConnect = async () => {
	const uri = process.env.URL

	let client = new mongodb.MongoClient(uri)
	await client.connect()

	database = client.db("collection")
}

app.post("/insert-moves", async (req, res) => {
	const data = req.body
	const winnerMoves = data.winnerMoves
	const lossesMoves = data.lossesMoves
	const collection = database.collection("moves")

	for (const move of winnerMoves) {
		const query = { left: move.left, right: move.right }
		const dbMove = await collection.findOne(query)
		if (dbMove) {
			dbMove.winsCounter++
			await collection.updateOne(query, dbMove)
		} else {
			move.winsCounter = 1
			move.lossesCounter = 0
			await collection.insertOne(move)
		}
	}

	for (const move of lossesMoves) {
		const query = { left: move.left, right: move.right }
		const dbMove = await collection.findOne(query)
		if (dbMove) {
			dbMove.lossesCounter++
			await collection.updateOne(query, dbMove)
		} else {
			move.winsCounter = 0
			move.lossesCounter = 1
			await collection.insertOne(move)
		}
	}
})

app.get("/choose", async (req, res) => {
	const data = req.body
	const possibleMoves = data.possibilities

	const rightsAndLeftsArray = possibleMoves.map((move) => {
		return { left: move.left, right: move.right }
	})

	const query = { $in: rightsAndLeftsArray }

	const chosenMove = possibleMoves.reduce(() => {}, Promise.resolve())
})

const start = (async (port) => {
	try {
		await dbConnect()

		app.listen(port, () => {
			console.log("listening on port " + port)
		})
	} catch (error) {
		console.log(error)
	}
})(process.env.PORT)
