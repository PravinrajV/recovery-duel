from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
c=canvas.Canvas("estimate_CLM-00017_tampered.pdf",pagesize=letter)
y=740
def L(t,size=11,dy=18):
    global y; c.setFont("Helvetica",size); c.drawString(60,y,t); y-=dy
L("SYNTHETIC DEMO DOCUMENT - NOT A REAL ESTIMATE",13,24)
L("Lakeside Collision Repair (SIMULATED SHOP)",12)
L("Repair Estimate No. EST-44818     Date: 2026-03-12")
L("Claim ID: CLM-00017")
L("VIN: 1HGCV1F30LA099999")
L("Vehicle: 2020 Honda Accord")
L("Cause of loss noted by shop: front airbag inflator rupture after minor impact",11,26)
L("Line items:",12)
L("  Parts: driver airbag module, steering wheel trim ......  $3,420.00")
L("  Labor: 14.5 hrs @ $95.00 ...............................  $1,377.50")
L("  Paint and materials .....................................    $610.00")
L("  Sublet: SRS diagnostic ..................................    $185.00",11,26)
L("Subtotal: $5,592.50")
L("Tax: $335.55")
L("TOTAL ESTIMATE: $9,928.05",12,26)
L("Prepared by: SIMULATED estimator. Synthetic data for the Recovery Duel demo.",9)
c.save()
