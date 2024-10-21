import { PrismaClient } from '@prisma/client';
import elasticClient from '@/lib/elasticsearch';

const prisma = new PrismaClient();

export async function POST(req) {
  const { title, content } = await req.json();
  
  // Save post in SQLite
  const post = await prisma.post.create({
    data: { title, content },
  });

  // Index post in Elasticsearch
  await elasticClient.index({
    index: 'posts',
    id: post.id.toString(),
    body: { title, content },
  });

  return new Response(JSON.stringify(post), { status: 201 });
}

export async function DELETE(req, { params }) {
    const { id } = params;
  
    try {
      // Delete post from SQLite
      await prisma.post.delete({
        where: { id: parseInt(id) },
      });
  
      // Delete post from Elasticsearch
      await elasticClient.delete({
        index: 'posts',
        id: id.toString(),
      });
  
      return new Response(JSON.stringify({ message: 'Post deleted successfully' }), { status: 200 });
    } catch (error) {
      console.error(error);
      return new Response(JSON.stringify({ error: 'Failed to delete post' }), { status: 500 });
    }
  }

  //https://chatgpt.com/share/6711cd6f-1620-8002-9b7b-89b272b1819e