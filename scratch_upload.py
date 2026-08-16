import os
import requests
from reportlab.pdfgen import canvas

pdf_path = "C:/Unicric Stats/scratch_scorecard.pdf"
c = canvas.Canvas(pdf_path)

lines = [
    "Match Details",
    "Match Peradeniya University vs Moratuwa University",
    "Ground University Of Moratuwa Ground, Moratuwa",
    "Date 2026-08-01, 04:17 AM UTC",
    "Result Moratuwa University won by 5 wickets",
    "Total Peradeniya University 114/10 (46.0 Ov)",
    "Batsmen",
    "Sathira Vikasitha 48 63 6 0 76.19",
    "Muftee Mysan 33 28 4 1 117.86",
    "Nadeeshan Bandara 28 49 2 0 57.14",
    "Pulitha Sarathchandra 26 70 0 0 37.14",
    "Nahularaja Kathurshan 19 46 3 0 41.30",
    "G P Rashmika 12 46 1 0 26.09",
    "Behan Wickramasinghe 10 16 2 0 62.50",
    "Vijayan Yashwinshan 10 23 1 0 43.48",
    "Devdun Nethusahan 9 25 1 0 36.00",
    "Kevindu Perera 8 9 0 1 88.89",
    "Isuru Kuruneru 5 10 0 0 50.00",
    "Janeesha Hansaka 2 4 0 0 50.00",
    "Maneesha Nilanduwa 2 14 0 0 14.29",
    "Deshan Ekanayake 2 6 0 0 33.33",
    "Sasith Rambukwella 1 2 0 0 50.00",
    "Sahan Arumasinghe 0 3 0 0 0.00",
    "Kavindu Bandara 0 6 0 0 0.00",
    "Lahiru Amarasekara 0 4 0 0 0.00",
    "Bowlers",
    "Isuru Kuruneru 6.0 1 24 0 4.00",
    "Muftee Mysan 6.0 1 20 0 3.33",
    "Kelum Hirudika 4.0 0 10 1 2.50",
    "Behan Wickramasinghe 4.0 0 7 2 1.75",
    "Sanithu Wijerathne 8.0 3 15 1 1.88",
    "Kevindu Perera 6.0 1 16 3 2.67",
    "Yasiru Ruwantha 10.0 0 25 1 2.50",
    "Lahiru Amarasekara 8.0 1 20 1 2.50",
    "Nadeeshan Bandara 2.0 0 20 0 10.00",
    "Vijayan Yashwinshan 2.0 0 14 0 7.00",
    "Janeesha Hansaka 1.0 0 9 0 9.00",
    "Deshan Ekanayake 7.0 1 20 2 2.86",
    "Kavindu Bandara 6.3 1 28 3 4.31"
]

y = 800
for line in lines:
    c.drawString(100, y, line)
    y -= 20

c.save()

url = "https://unicric-backend.onrender.com/api/process-pdf-scorecard"
with open(pdf_path, 'rb') as f:
    files = {'file': ('scratch_scorecard.pdf', f, 'application/pdf')}
    print("Uploading to", url)
    r = requests.post(url, files=files)
    print(r.status_code)
    try:
        print(r.json())
    except:
        print(r.text)
