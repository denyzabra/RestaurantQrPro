import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Printer, QrCode } from "lucide-react";

interface QRCodeGeneratorProps {
  value: string;
  tableNumber: string;
  size?: number;
}

export default function QRCodeGenerator({ value, tableNumber, size = 200 }: QRCodeGeneratorProps) {
  
  const generateQRCode = (text: string, size: number) => {
    // Simple QR code representation using CSS grid
    // In a real app, you'd use a library like qrcode or react-qr-code
    const qrPattern = [
      [1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,1,0,0,1,1,0,1,0,0,0,1],
      [1,0,1,1,1,0,1,0,1,0,0,1,1,0,1,1,1],
      [1,0,1,1,1,0,1,0,1,1,0,0,1,0,1,1,1],
      [1,0,1,1,1,0,1,0,0,0,1,1,1,0,1,1,1],
      [1,0,0,0,0,0,1,0,1,0,1,0,1,0,0,0,1],
      [1,1,1,1,1,1,1,0,1,0,1,0,1,1,1,1,1],
      [0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0],
      [1,1,0,1,1,0,1,1,1,0,1,0,1,1,0,1,1],
      [0,1,1,0,0,1,0,0,0,1,0,1,0,0,1,0,0],
      [1,0,1,1,0,0,1,1,1,0,1,0,1,1,0,1,1],
      [0,0,0,1,1,1,0,0,0,1,0,1,0,0,1,0,0],
      [1,1,1,0,0,0,1,1,1,0,1,0,1,1,0,1,1],
      [0,0,0,0,0,0,0,0,1,1,0,1,0,0,1,0,0],
      [1,1,1,1,1,1,1,0,0,0,1,0,1,1,0,1,1],
      [1,0,0,0,0,0,1,0,1,1,0,1,0,0,1,0,0],
      [1,0,1,1,1,0,1,0,0,0,1,0,1,1,0,1,1],
    ];

    return (
      <div 
        className="inline-block bg-white p-4 rounded-lg shadow-lg"
        style={{ width: size, height: size }}
      >
        <div className="grid grid-cols-17 gap-0 w-full h-full">
          {qrPattern.flat().map((cell, index) => (
            <div
              key={index}
              className={`${cell ? 'bg-black' : 'bg-white'} aspect-square`}
            />
          ))}
        </div>
      </div>
    );
  };

  const handleDownload = () => {
    // In a real app, you'd generate and download the actual QR code image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = size;
    canvas.height = size;
    
    if (ctx) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = 'black';
      
      // Simple pattern for demo
      const cellSize = size / 17;
      for (let i = 0; i < 17; i++) {
        for (let j = 0; j < 17; j++) {
          if ((i + j) % 3 === 0) {
            ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
          }
        }
      }
    }
    
    const link = document.createElement('a');
    link.download = `table-${tableNumber}-qr.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Table ${tableNumber} QR Code</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                text-align: center; 
                padding: 20px;
                margin: 0;
              }
              .qr-container {
                display: inline-block;
                border: 2px solid #000;
                padding: 20px;
                margin: 20px;
              }
              .table-info {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 10px;
              }
              .instructions {
                font-size: 14px;
                margin-top: 15px;
                color: #666;
              }
              @media print {
                body { padding: 0; }
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <div class="table-info">Table ${tableNumber}</div>
              <div style="width: 200px; height: 200px; background: #f0f0f0; margin: 20px auto; display: flex; align-items: center; justify-content: center; border: 1px solid #ccc;">
                <span style="color: #666;">QR Code</span>
              </div>
              <div class="instructions">
                Scan this QR code with your phone camera<br/>
                to view the menu and place your order
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
      printWindow.close();
    }
  };

  return (
    <Card>
      <CardContent className="p-6 text-center">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Table {tableNumber}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Scan to access menu and place order
          </p>
        </div>

        <div className="flex justify-center mb-6">
          <div className="bg-white p-4 rounded-lg shadow-lg border-2 border-gray-200">
            <div className="w-48 h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-500">QR Code for Table {tableNumber}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-600 mb-4 space-y-1">
          <p><strong>URL:</strong> {value}</p>
          <p>Place this QR code on the table for customers to scan</p>
        </div>

        <div className="flex justify-center space-x-3">
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Printer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
