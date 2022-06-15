import express, { json } from 'express'
import cors from 'cors'
import 'dotenv/config'
import mongodb from 'mongodb'

const app = express()

app.use(json())

app.use(
	cors({
		origin: '*',
	})
)

var database = undefined

const dbConnect = async () => {
	const uri = process.env.URL

	let client = new mongodb.MongoClient(uri)
	await client.connect()

	database = client.db('collection')
}

app.post('/insert-moves', async (req, res) => {
	const data = req.body
	const winnerMoves = data.winnerMoves
	const lossesMoves = data.lossesMoves
	const collection = database.collection('moves')

	try {
		for (const move of winnerMoves) {
			const query = { left: move.left, right: move.right }
			const dbMove = await collection.findOne(query)
			if (dbMove) {
				await collection.updateOne(query, {
					$set: { winsCounter: dbMove.winsCounter + 1 },
				})
			} else {
				await collection.insertOne({
					left: move.left,
					right: move.right,
					winsCounter: 1,
					lossesCounter: 0,
				})
			}
		}

		for (const move of lossesMoves) {
			const query = { left: move.left, right: move.right }
			const dbMove = await collection.findOne(query)
			if (dbMove) {
				await collection.updateOne(query, {
					$set: { lossesCounter: dbMove.lossesCounter + 1 },
				})
			} else {
				await collection.insertOne({
					left: move.left,
					right: move.right,
					winsCounter: 0,
					lossesCounter: 1,
				})
			}
		}

		res.sendStatus(200)
	} catch (e) {
		console.log(e)
		res.sendStatus(500)
	}
})

app.post('/choose', async (req, res) => {
	const data = req.body
	const possibleMoves = data.possibilities

	const rightsAndLeftsArray = possibleMoves.map((move) => {
		return { left: move.left, right: move.right }
	})

	const query = { $in: rightsAndLeftsArray }

	const collection = database.collection('moves')

	collection.find()
	//const chosenMove = possibleMoves.reduce(() => {}, Promise.resolve())
})

const start = async (port) => {
	try {
		await dbConnect()

		app.listen(port, () => {
			console.log('listening on port ' + port)
		})
	} catch (error) {
		console.log(error)
	}
}

start(process.env.PORT)
