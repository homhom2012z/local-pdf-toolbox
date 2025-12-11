import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const DEFAULT_QPDF_PATH =
  process.platform === "linux"
    ? path.join(process.cwd(), "backend/bin/qpdf")
    : "qpdf";
const QPDF_BINARY_PATH =
  process.env.QPDF_BINARY_PATH?.trim() || DEFAULT_QPDF_PATH;

export const runtime = "nodejs";

export async function POST(request: Request) {
  let inputPath: string | null = null;
  let outputPath: string | null = null;

  try {
    const formData = await request.formData();
    const pdfFile = formData.get("pdf");
    const password = formData.get("password");

    if (!(pdfFile instanceof File)) {
      return new NextResponse("PDF file is required.", { status: 400 });
    }

    if (typeof password !== "string" || password.length === 0) {
      return new NextResponse("Password is required.", { status: 400 });
    }

    if (pdfFile.size === 0) {
      return new NextResponse("The provided PDF is empty.", { status: 400 });
    }

    if (pdfFile.size > MAX_FILE_SIZE) {
      return new NextResponse("PDF file is too large.", { status: 400 });
    }

    const arrayBuffer = await pdfFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    inputPath = path.join(tmpdir(), `pdf-input-${randomUUID()}.pdf`);
    outputPath = path.join(tmpdir(), `pdf-output-${randomUUID()}.pdf`);

    await fs.writeFile(inputPath, buffer);

    try {
      await execFileAsync(QPDF_BINARY_PATH, [
        `--password=${password}`,
        "--decrypt",
        inputPath,
        outputPath,
      ]);
    } catch (error: any) {
      if (error?.code === "ENOENT") {
        console.error("qpdf binary not found:", error);
        return new NextResponse(
          "qpdf binary not found. Set QPDF_BINARY_PATH to a valid executable.",
          { status: 500 }
        );
      }

      console.error("Failed to unlock PDF:", error);
      return new NextResponse(
        error?.stderr?.toString() ||
          "Failed to unlock PDF. Wrong password or file is not encrypted.",
        { status: 400 }
      );
    }

    const unlockedPdf = await fs.readFile(outputPath);
    return new NextResponse(unlockedPdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="unlocked.pdf"',
        "Content-Length": unlockedPdf.length.toString(),
      },
    });
  } catch (error) {
    console.error("Unexpected unlock error:", error);
    return new NextResponse(
      "Unexpected error while unlocking PDF. Please try again.",
      { status: 500 }
    );
  } finally {
    await Promise.all(
      [inputPath, outputPath]
        .filter((filePath): filePath is string => Boolean(filePath))
        .map(async (filePath) => {
          try {
            await fs.unlink(filePath);
          } catch {
            // ignore cleanup errors
          }
        })
    );
  }
}
