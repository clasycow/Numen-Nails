"""Rebuild the Numen Nails vector print collection and brand guide."""
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, Color
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.graphics.barcode.qr import QrCodeWidget
from reportlab.graphics.shapes import Drawing
from reportlab.graphics import renderPDF
from reportlab.lib.utils import ImageReader
from PIL import Image
from fontTools.ttLib import TTFont as FontToolsFont
from io import BytesIO
import textwrap
ROOT=Path(__file__).resolve().parents[2]; OUT=ROOT/'assets/brand'
for name,file in [('Atelier','cormorant-garamond-latin-500-normal.woff'),('Nunito','nunito-latin-400-normal.woff')]:
 f=FontToolsFont(ROOT/'assets/fonts'/file); f.flavor=None; buf=BytesIO(); f.save(buf); buf.seek(0); pdfmetrics.registerFont(TTFont(name,buf))
INK='#211c29'; PAPER='#f1e9df'; GOLD='#d7bd8b'; LAV='#c4a0ce'; MUTED='#c2b5c6'
def text(c,s,x,y,size=10,font='Nunito',color=PAPER,align='left'):
 c.setFillColor(HexColor(color));c.setFont(font,size)
 getattr(c,{'left':'drawString','center':'drawCentredString','right':'drawRightString'}[align])(x,y,s)
def wrap(c,s,x,y,width,size=9,leading=13,color=MUTED,font='Nunito'):
 line=''
 for word in s.split():
  test=(line+' '+word).strip()
  if pdfmetrics.stringWidth(test,font,size)>width and line:
   text(c,line,x,y,size,font,color);y-=leading;line=word
  else:line=test
 if line:text(c,line,x,y,size,font,color);y-=leading
 return y

def moon(c,x,y,r,bg=INK):
 c.setFillColor(HexColor(GOLD));c.circle(x,y,r,fill=1,stroke=0);c.setFillColor(HexColor(bg));c.circle(x+r*.43,y+r*.18,r*.87,fill=1,stroke=0)
 p=c.beginPath();sx=x+r*.9;sy=y-r*.18
 p.moveTo(sx,sy+r*.38);p.lineTo(sx+r*.1,sy+r*.1);p.lineTo(sx+r*.38,sy);p.lineTo(sx+r*.1,sy-r*.1);p.lineTo(sx,sy-r*.38);p.lineTo(sx-r*.1,sy-r*.1);p.lineTo(sx-r*.38,sy);p.lineTo(sx-r*.1,sy+r*.1);p.close();c.setFillColor(HexColor(GOLD));c.drawPath(p,fill=1,stroke=0)
def base(c,w,h,printpage=False):
 c.setPageSize((w,h));c.setFillColor(HexColor(INK));c.rect(0,0,w,h,fill=1,stroke=0);c.setStrokeColor(HexColor(GOLD));c.setLineWidth(.45);inset=18 if printpage else 30;c.rect(inset,inset,w-inset*2,h-inset*2,fill=0,stroke=1)
 if printpage:c.setTrimBox((9,9,w-9,h-9));c.setBleedBox((0,0,w,h))
def qr(c,url,x,y,size,bg=INK):
 c.setFillColor(HexColor(PAPER));c.rect(x,y,size,size,fill=1,stroke=0)
 q=QrCodeWidget(url,barFillColor=HexColor(INK),barStrokeColor=HexColor(INK),barLevel='M',barBorder=4);bounds=q.getBounds();width=bounds[2]-bounds[0];d=Drawing(size,size,transform=[size/width,0,0,size/width,0,0]);d.add(q);renderPDF.draw(d,c,x,y)
c=canvas.Canvas(str(OUT/'numen-nails-print-kit.pdf'));c.setTitle('Numen Nails | The Print Collection');c.setAuthor('Numen Nails')
# Business card front: 3.5 x 2 in trim, 0.125 in bleed.
w,h=270,162;base(c,w,h,True);moon(c,54,96,14);text(c,'Numen Nails',91,94,29,'Atelier');text(c,'A little magic, made yours.',92,74,10,'Atelier',LAV);text(c,'numennails.com',28,35,8);c.showPage()
# Business card back.
base(c,w,h,True);text(c,'YOUR NEXT LITTLE',29,127,7,'Nunito',GOLD);text(c,'obsession.',29,97,31,'Atelier');wrap(c,'Custom nail art and made-to-measure press-ons.',29,76,125,8,12);text(c,'Explore. Imagine. Inquire.',29,31,7,'Nunito',LAV);qr(c,'https://numennails.com/studio.html',183,48,62);c.showPage()
# Care card, 4 x 6 inch trim.
w,h=306,450;base(c,w,h,True);moon(c,w/2,401,12);text(c,'Keep the magic.',w/2,366,30,'Atelier',PAPER,'center');text(c,'A LITTLE CARE GOES A LONG WAY',w/2,344,7,'Nunito',GOLD,'center')
y=307
for i,(head,body) in enumerate([
 ('Treat them gently.','Use your fingertips, not your nails, to open, peel, and lift.'),
 ('Protect your set.','Wear gloves for cleaning. Avoid picking at edges or embellishments.'),
 ('Keep care simple.','Keep hands clean and dry. Follow the aftercare instructions provided with your service.'),
 ('Remove with care.','Never force, bite, or pull off your set. Follow your adhesive instructions or ask your nail artist.'),
 ('Stay in touch.','For a repair, removal, or advice about your set, contact Numen Nails.')]):
 text(c,f'0{i+1}',29,y,8,'Nunito',GOLD);text(c,head,55,y-1,16,'Atelier');y=wrap(c,body,55,y-17,217,8,11)-15
text(c,'Numen Nails  |  numennails.com',w/2,28,7,'Nunito',PAPER,'center');c.showPage()
# Flat packaging label 4 x 3 inches.
w,h=306,234;base(c,w,h,True);moon(c,w/2,185,13);text(c,'Numen Nails',w/2,133,36,'Atelier',PAPER,'center');text(c,'A little magic, made yours.',w/2,106,16,'Atelier',LAV,'center');text(c,'CUSTOM PRESS-ONS',w/2,67,8,'Nunito',GOLD,'center');text(c,'numennails.com',w/2,33,8,'Nunito',PAPER,'center');c.showPage()
# Thank-you insert 5 x 3 inches.
w,h=378,234;base(c,w,h,True);text(c,'Made for your',33,159,32,'Atelier');text(c,'kind of magic.',33,127,32,'Atelier',LAV);wrap(c,'Thank you for choosing Numen Nails. I hope your set brings a little wonder to your everyday.',34,99,210,9,13);qr(c,'https://numennails.com',280,72,66);text(c,'A little care. A little confidence. A little moonlight.',34,33,8,'Nunito',GOLD);c.showPage();c.save()
# Brand guide.
c=canvas.Canvas(str(OUT/'numen-nails-brand-guide.pdf'),pagesize=(612,792));c.setTitle('Numen Nails | Brand Guide');c.setAuthor('Numen Nails')
base(c,612,792);moon(c,74,707,18);text(c,'NUMEN NAILS',112,704,10,'Nunito',GOLD);text(c,'A little magic.',50,613,60,'Atelier');text(c,'Made yours.',50,549,60,'Atelier',LAV);wrap(c,'An enchanted world, grounded in personal care. A visual identity for the studio, the screen, and the small details clients take home.',52,493,420,12,19)
cover=BytesIO();Image.open(ROOT/'assets/img/enchanted-salon.webp').convert('RGB').save(cover,format='JPEG',quality=90);cover.seek(0)
c.drawImage(ImageReader(cover),50,105,width=512,height=310,mask='auto',preserveAspectRatio=False);text(c,'BRAND NOTES / 01',52,56,8,'Nunito',GOLD);text(c,'numennails.com',560,56,8,'Nunito',MUTED,'right');c.showPage()
base(c,612,792);text(c,'THE VISUAL WORLD',50,719,9,'Nunito',GOLD);text(c,'Moonlight, with warmth.',50,664,43,'Atelier');text(c,'The palette',50,597,27,'Atelier')
for i,(name,col) in enumerate([('Midnight plum',INK),('Warm parchment',PAPER),('Soft gold',GOLD),('Wild lavender',LAV),('Quiet mauve',MUTED)]):
 x=50+i*104;c.setFillColor(HexColor(col));c.setStrokeColor(HexColor(MUTED));c.setLineWidth(.4);c.rect(x,493,92,75,fill=1,stroke=1);text(c,name,x,476,7.2,'Nunito');text(c,col.upper(),x,460,8,'Nunito',MUTED)
text(c,'The typography',50,402,27,'Atelier');text(c,'Cormorant Garamond',50,351,36,'Atelier',LAV);wrap(c,'Expressive headings, generous space, and a gentle editorial rhythm. Use for collection names, invitations, and memorable phrases.',50,322,490,10,16);text(c,'Nunito',50,252,19,'Nunito');wrap(c,'Clear, friendly supporting copy. Use for navigation, service details, instructions, and anything a client needs to read quickly.',50,225,490,10,16)
text(c,'The signature',50,150,27,'Atelier');moon(c,71,99,17);wrap(c,'A crescent and a small star. Keep the mark simple, with clear space on every side. Use gold on plum or plum on light backgrounds.',111,117,425,10,16);text(c,'BRAND NOTES / 02',52,56,8,'Nunito',GOLD);c.showPage()
base(c,612,792);text(c,'HOW THE BRAND SPEAKS',50,719,9,'Nunito',GOLD);text(c,'Personal. Curious. Lovely.',50,663,43,'Atelier')
y=600
for head,body in [('A voice that feels human','Use warm invitations and concrete details: "Let’s make something lovely." "Bring your idea." "Made for your kind of magic." Keep booking instructions direct.'),('Photography comes first','Use the real collection photographs for nail designs. Keep color and texture honest. Enchanted scenery frames the work; it does not replace the work.'),('A small, useful system','The brand studio exports social posts, vertical stories, business cards, care cards, and packaging labels. The SVG crescent scales cleanly for digital or print use.'),('Before printing','The print collection uses a 0.125-inch bleed and a defined trim box. Card trim: 3.5 x 2 in. Care card: 4 x 6 in. Label: 4 x 3 in. Thank-you insert: 5 x 3 in. Print at actual size; ask your printer for a color proof and their preferred color conversion.'),('Keep it yours','Update prices through the owner desk once connected. Confirm contact and service information before a print run. The packaging art is a flat label, not a structural box dieline.')]:
 text(c,head,50,y,25,'Atelier',LAV);y=wrap(c,body,50,y-27,505,10,16)-27
text(c,'BRAND NOTES / 03',52,56,8,'Nunito',GOLD);c.showPage();c.save()
print('Created print kit (5 pages) and brand guide (3 pages).')
