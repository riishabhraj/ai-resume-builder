#!/bin/bash

# Script to generate template preview images from LaTeX templates
# Requires: pdflatex, ImageMagick or pdftoppm

TEMPLATES_DIR="lib/templates"
PREVIEWS_DIR="public/templates/previews"
SAMPLE_DATA="scripts/sample-resume-data.tex"

# Create previews directory
mkdir -p "$PREVIEWS_DIR"

# Sample resume data for previews
cat > "$SAMPLE_DATA" << 'EOF'
\documentclass[11pt,a4paper]{article}
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage{lmodern}
\usepackage[margin=0.75in]{geometry}
\usepackage{enumitem}
\usepackage{hyperref}

\pagestyle{empty}
\setlength{\parindent}{0pt}
\setlist[itemize]{leftmargin=*,nosep}

\begin{document}

\begin{center}
{\Large \textbf{John Doe}}\\[0.3em]
john.doe@email.com | San Francisco, CA | (555) 123-4567
\end{center}

\vspace{1em}

\section*{Professional Summary}
Experienced software engineer with 5+ years building scalable web applications. Expert in React, Node.js, and cloud infrastructure.

\vspace{1em}

\section*{Work Experience}

\textbf{Senior Software Engineer — Tech Corp (2020-2024)}\\[0.3em]
\begin{itemize}
\item Led team of 5 engineers in agile development
\item Improved application performance by 40\%
\item Launched new product feature reaching 10K users
\end{itemize}

\vspace{0.5em}

\textbf{Software Engineer — Startup Inc (2018-2020)}\\[0.3em]
\begin{itemize}
\item Built RESTful APIs serving 1M+ requests daily
\item Reduced deployment time by 50\%
\end{itemize}

\vspace{1em}

\section*{Skills}
JavaScript, React, Node.js, Python, SQL, AWS, Docker

\vspace{1em}

\section*{Education}
Bachelor of Science in Computer Science, University Name, 2018

\end{document}
EOF

# Function to generate preview for a template
generate_preview() {
    local template_id=$1
    local template_file="$TEMPLATES_DIR/${template_id}.tex"
    local output_pdf="/tmp/${template_id}_preview.pdf"
    local output_png="$PREVIEWS_DIR/${template_id}.png"
    
    if [ ! -f "$template_file" ]; then
        echo "Template $template_id not found, skipping..."
        return
    fi
    
    echo "Generating preview for $template_id..."
    
    # Compile LaTeX to PDF (using sample data for now)
    # In production, you'd use the actual template with sample data
    pdflatex -interaction=nonstopmode -output-directory=/tmp "$SAMPLE_DATA" > /dev/null 2>&1
    
    # Convert first page of PDF to PNG
    if command -v convert &> /dev/null; then
        convert -density 150 "/tmp/sample-resume-data.pdf[0]" -resize 400x600 "$output_png"
    elif command -v pdftoppm &> /dev/null; then
        pdftoppm -png -f 1 -l 1 -scale-to-x 400 -scale-to-y 600 "/tmp/sample-resume-data.pdf" "$PREVIEWS_DIR/${template_id}"
        mv "$PREVIEWS_DIR/${template_id}-1.png" "$output_png"
    else
        echo "Error: ImageMagick or pdftoppm not found. Please install one of them."
        return 1
    fi
    
    echo "✓ Generated $output_png"
}

# Generate previews for all templates
for template in modern classic minimal professional; do
    generate_preview "$template"
done

# Cleanup
rm -f "$SAMPLE_DATA" /tmp/*.aux /tmp/*.log /tmp/*.pdf

echo "Done! Preview images generated in $PREVIEWS_DIR"

