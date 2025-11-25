#!/bin/bash

echo "Testing ATS Resume Builder API..."
echo ""

echo "Testing LaTeX Service Health..."
LATEX_HEALTH=$(curl -s http://localhost:3001/health)
if [[ $LATEX_HEALTH == *"ok"* ]]; then
  echo "✓ LaTeX service is running"
else
  echo "✗ LaTeX service is not running"
  echo "  Start it with: docker-compose up -d"
  exit 1
fi

echo ""
echo "Testing Resume Generation API..."
echo "This will create a test resume in your database."
echo ""

RESPONSE=$(curl -s -X POST http://localhost:3000/api/resume/generate \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Jane Smith",
    "title": "Senior Software Engineer",
    "email": "jane.smith@example.com",
    "location": "New York, NY",
    "summary": "Experienced software engineer with 5+ years building scalable web applications. Expert in React, Node.js, and cloud infrastructure. Passionate about creating efficient, maintainable code.",
    "skills": "JavaScript, TypeScript, React, Node.js, Express, PostgreSQL, AWS, Docker, Kubernetes, CI/CD, Agile",
    "experiences": [
      {
        "company": "Tech Innovations Inc",
        "role": "Senior Software Engineer",
        "start": "Jan 2021",
        "end": "Present",
        "bullets": [
          "Led development of microservices architecture serving 1M+ users, reducing response time by 40%",
          "Mentored team of 5 junior engineers and conducted code reviews",
          "Implemented CI/CD pipeline reducing deployment time from 2 hours to 15 minutes",
          "Architected real-time notification system using WebSockets and Redis"
        ]
      },
      {
        "company": "StartUp Labs",
        "role": "Full Stack Developer",
        "start": "Jun 2019",
        "end": "Dec 2020",
        "bullets": [
          "Built customer-facing dashboard using React and Material-UI",
          "Developed RESTful APIs with Node.js and Express serving 50k+ requests/day",
          "Optimized database queries improving application performance by 60%"
        ]
      }
    ],
    "education": "Bachelor of Science in Computer Science, MIT, 2019 - GPA: 3.8/4.0",
    "jobDescription": "We are looking for a Senior Software Engineer with strong experience in React, Node.js, and AWS. Must have experience with microservices architecture, CI/CD, and leading engineering teams. Knowledge of Docker and Kubernetes is a plus."
  }')

if [[ $RESPONSE == *"resumeId"* ]]; then
  RESUME_ID=$(echo $RESPONSE | grep -o '"resumeId":"[^"]*' | sed 's/"resumeId":"//')
  ATS_SCORE=$(echo $RESPONSE | grep -o '"atsScore":[0-9]*' | sed 's/"atsScore"://')

  echo "✓ Resume generated successfully!"
  echo "  Resume ID: $RESUME_ID"
  echo "  ATS Score: $ATS_SCORE/100"
  echo ""
  echo "View your resume at:"
  echo "  http://localhost:3000/resume/$RESUME_ID"
  echo ""
  echo "Or visit the dashboard:"
  echo "  http://localhost:3000/dashboard"
else
  echo "✗ Failed to generate resume"
  echo "Response: $RESPONSE"
  echo ""
  echo "Check:"
  echo "  - Is the dev server running? (npm run dev)"
  echo "  - Are environment variables set in .env.local?"
  echo "  - Is your OpenAI/Groq API key valid?"
fi

echo ""
echo "Test complete!"
