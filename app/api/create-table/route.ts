import pg from "pg";

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

export async function GET(request: Request) {
  try {
    const client = await pool.connect();
    const result = await client.query(
      "CREATE TABLE Allowlist (addresses text[]);",
    );
    client.release();
    return new Response(JSON.stringify({ result: result.rows }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
    });
  }
}
