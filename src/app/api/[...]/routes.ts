import { connectToDatabase } from '@/lib/db/mongoose';

export async function GET() {
  await connectToDatabase();
  // Your API logic here
}