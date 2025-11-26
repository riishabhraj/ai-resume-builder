import type { Metadata } from 'next';
import { getResumeHtmlById } from '@/lib/resume/getResumeHtmlById';

type Props = {
  params: Promise<{ id: string }>;
};

const PRINT_STYLES = `
  @page { size: A4; margin: 0; }
  html, body {
    width: 210mm;
    height: 297mm;
    margin: 0;
    padding: 0;
    background: #f4f4f4;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .print-wrapper {
    width: 210mm;
    min-height: 297mm;
    margin: 0 auto;
    box-sizing: border-box;
    padding: 20mm;
    background: white;
    font-size: 12pt;
    line-height: 1.25;
  }
  .avoid-break { page-break-inside: avoid; }
`;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Resume Preview · ${id}`,
  };
}

export default async function ResumePrintPage({ params }: Props) {
  const { id } = await params;
  const resumeHtml = await getResumeHtmlById(id);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PRINT_STYLES }} />
      <div
        className="print-wrapper"
        dangerouslySetInnerHTML={{ __html: resumeHtml }}
      />
    </>
  );
}

