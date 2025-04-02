import clientPromise from '@/lib/db'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("reemind")
    
    // Example query
    const collection = db.collection("your_collection")
    const results = await collection.find({}).limit(10).toArray()
    
    return Response.json(results)
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
} 