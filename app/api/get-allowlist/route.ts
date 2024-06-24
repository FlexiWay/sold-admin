import pg from "pg";

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

export async function GET() {
  try {
    const client = await pool.connect();
    const { rows: result } = await client.query(
      "SELECT addresses FROM Allowlist;",
    );
    client.release();

    return new Response(JSON.stringify(result[0]), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
    });
  }
}
