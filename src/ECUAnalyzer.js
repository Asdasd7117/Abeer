import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ECUAnalyzer() {
    const [binFile, setBinFile] = useState(null);
    const [dtcCodes, setDtcCodes] = useState([]);
    const [selectedCodes, setSelectedCodes] = useState([]);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBinFile(file);
            analyzeBinFile(file);
        }
    };

    const analyzeBinFile = async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const exampleDtcCodes = ['P0430', 'P0420', 'P0300'];
        setDtcCodes(exampleDtcCodes);
    };

    const handleCodeSelection = (code) => {
        setSelectedCodes((prev) =>
            prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
        );
    };

    const handleSaveModifiedFile = () => {
        if (!binFile) return;

        const reader = new FileReader();
        reader.onload = () => {
            const arrayBuffer = reader.result;
            const uint8Array = new Uint8Array(arrayBuffer);

            selectedCodes.forEach((code) => {
                for (let i = 0; i < uint8Array.length; i++) {
                    uint8Array[i] = uint8Array[i] === 0x43 ? 0x00 : uint8Array[i];
                }
            });

            const blob = new Blob([uint8Array], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = 'modified_file.bin';
            a.click();

            URL.revokeObjectURL(url);
        };
        reader.readAsArrayBuffer(binFile);
    };

    return (
        <div className="p-4">
            <Card className="mb-4">
                <CardContent>
                    <h1 className="text-xl font-bold mb-2">ECU BIN File Analyzer</h1>
                    <input type="file" accept=".bin" onChange={handleFileUpload} />
                </CardContent>
            </Card>

            {dtcCodes.length > 0 && (
                <Card className="mb-4">
                    <CardContent>
                        <h2 className="text-lg font-semibold mb-2">Detected DTC Codes</h2>
                        <ul>
                            {dtcCodes.map((code) => (
                                <li key={code}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            value={code}
                                            checked={selectedCodes.includes(code)}
                                            onChange={() => handleCodeSelection(code)}
                                        />
                                        {code}
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            {selectedCodes.length > 0 && (
                <Button onClick={handleSaveModifiedFile}>
                    Save Modified BIN File
                </Button>
            )}
        </div>
    );
}