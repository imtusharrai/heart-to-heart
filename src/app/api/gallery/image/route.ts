import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Path to the data file
const dataFilePath = path.join(process.cwd(), 'src/data/gallery.json');

// Helper function to read data
function getData() {
  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify([]));
    return [];
  }
  const data = fs.readFileSync(dataFilePath, 'utf8');
  return JSON.parse(data);
}

// Helper function to write data
function writeData(data: any[]) {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
}

// POST handler - add a new image
export async function POST(request: NextRequest) {
  try {
    const newImage = await request.json();
    
    // Validate required fields
    if (!newImage.url || !newImage.albumId) {
      return NextResponse.json(
        { message: 'Image URL and albumId are required' },
        { status: 400 }
      );
    }
    
    // Ensure the image has an ID
    if (!newImage.id) {
      newImage.id = uuidv4();
    }
    
    // Add creation timestamp if not provided
    if (!newImage.createdAt) {
      newImage.createdAt = new Date().toISOString();
    }
    
    // Get existing items
    const items = getData();
    
    // Verify the album exists
    const albumExists = items.some(item => item.id === newImage.albumId);
    if (!albumExists) {
      return NextResponse.json(
        { message: 'Album not found' },
        { status: 404 }
      );
    }
    
    // Add the new image
    items.push(newImage);
    
    // Save updated data
    writeData(items);
    
    return NextResponse.json(newImage);
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to add image' },
      { status: 500 }
    );
  }
}

// PUT handler - update an image
export async function PUT(request: NextRequest) {
  try {
    const updatedImage = await request.json();
    
    // Validate required fields
    if (!updatedImage.id || !updatedImage.url || !updatedImage.albumId) {
      return NextResponse.json(
        { message: 'Image ID, URL, and albumId are required' },
        { status: 400 }
      );
    }
    
    // Get existing items
    const items = getData();
    
    // Find the image to update
    const index = items.findIndex(item => item.id === updatedImage.id);
    
    // If image not found, return an error
    if (index === -1) {
      return NextResponse.json(
        { message: 'Image not found' },
        { status: 404 }
      );
    }
    
    // Verify the album exists
    const albumExists = items.some(item => item.id === updatedImage.albumId);
    if (!albumExists) {
      return NextResponse.json(
        { message: 'Album not found' },
        { status: 404 }
      );
    }
    
    // Update the image
    items[index] = {
      ...items[index],
      ...updatedImage,
      updatedAt: new Date().toISOString()
    };
    
    // Save updated data
    writeData(items);
    
    return NextResponse.json(items[index]);
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to update image' },
      { status: 500 }
    );
  }
}

// DELETE handler - delete an image
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { message: 'Image ID is required' },
        { status: 400 }
      );
    }
    
    // Get existing items
    const items = getData();
    
    // Filter out the image to delete
    const filteredItems = items.filter(item => item.id !== id);
    
    // If no image was removed, return an error
    if (items.length === filteredItems.length) {
      return NextResponse.json(
        { message: 'Image not found' },
        { status: 404 }
      );
    }
    
    // Save updated data
    writeData(filteredItems);
    
    return NextResponse.json({ message: 'Image deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to delete image' },
      { status: 500 }
    );
  }
}