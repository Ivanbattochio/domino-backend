import mongodb from "mongodb"

const dbConnect = async () => {
	const uri = process.env.url

	const client = new mongodb.MongoClient(uri)

	return client.connect
}

const getCollection = (db, collection) => {
	return db.collection(collection)
}

export { dbConnect, getCollection }
