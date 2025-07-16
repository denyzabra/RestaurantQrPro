import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Printer, QrCode } from "lucide-react";
import { useEffect, useRef } from "react";
import QRCode from "qrcode";

interface QRCodeGeneratorProps {
  value: string;
  tableNumber: string;
  size?: number;
}

export default function QRCodeGenerator({ value, tableNumber, size = 200 }: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    }
  }, [value, size]);

  const handleDownload = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `table-${tableNumber}-qr.png`;
      link.href = canvasRef.current.toDataURL();
      link.click();
    }
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
            <canvas 
              ref={canvasRef} 
              className="rounded-lg"
              style={{ width: size, height: size }}
            />
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
