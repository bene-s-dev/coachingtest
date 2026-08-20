#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generates an executive-ready, 2-page PDF Change Report for the Sarah Unke Coaching Website.
"""

import os
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import cm, mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """Canvas for adding running headers and page numbers (Page X of Y)."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        
        # Primary colors
        navy = colors.HexColor("#1D3D52")
        muted = colors.HexColor("#6B7C8A")
        light_line = colors.HexColor("#D5E4ED")
        
        # Running Header on page 2+
        if self._pageNumber > 1:
            self.setFont("Helvetica-Bold", 8)
            self.setFillColor(navy)
            self.drawString(1.8 * cm, 28.3 * cm, "SARAH UNKE COACHING-PRAXIS")
            self.setFont("Helvetica", 8)
            self.setFillColor(muted)
            self.drawRightString(19.2 * cm, 28.3 * cm, "Entwicklungs- & Optimierungsbericht")
            
            self.setStrokeColor(light_line)
            self.setLineWidth(0.75)
            self.line(1.8 * cm, 28.1 * cm, 19.2 * cm, 28.1 * cm)

        # Running Footer on all pages
        self.setStrokeColor(light_line)
        self.setLineWidth(0.75)
        self.line(1.8 * cm, 1.4 * cm, 19.2 * cm, 1.4 * cm)

        self.setFont("Helvetica", 7.5)
        self.setFillColor(muted)
        date_str = datetime.now().strftime("%d.%m.%Y")
        self.drawString(1.8 * cm, 0.95 * cm, f"Projekt: su-coaching.de | Erstellt am {date_str}")
        self.drawRightString(19.2 * cm, 0.95 * cm, f"Seite {self._pageNumber} von {page_count}")
        
        self.restoreState()


def create_change_report(output_filename):
    doc = SimpleDocTemplate(
        output_filename,
        pagesize=A4,
        leftMargin=1.8 * cm,
        rightMargin=1.8 * cm,
        topMargin=1.8 * cm,
        bottomMargin=1.8 * cm
    )

    styles = getSampleStyleSheet()

    # Color Palette
    c_navy = colors.HexColor("#1D3D52")
    c_ocean = colors.HexColor("#3A7CA5")
    c_light_bg = colors.HexColor("#F0F7FB")
    c_sand = colors.HexColor("#F7F3EB")
    c_text = colors.HexColor("#2C3E50")
    c_muted = colors.HexColor("#6B7C8A")
    c_border = colors.HexColor("#D5E4ED")
    c_success = colors.HexColor("#1E6B24")

    # Custom Typography Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=c_navy,
        spaceAfter=2
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=13,
        textColor=c_ocean,
        textTransform='uppercase',
        spaceAfter=8
    )

    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=c_navy,
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=c_ocean,
        spaceBefore=5,
        spaceAfter=2,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.2,
        leading=11.5,
        textColor=c_text,
        spaceAfter=4
    )

    body_bold = ParagraphStyle(
        'BodyBoldCustom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.2,
        leading=11.5,
        textColor=c_navy
    )

    bullet_style = ParagraphStyle(
        'BulletCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.2,
        leading=11.2,
        textColor=c_text,
        leftIndent=10,
        firstLineIndent=-7,
        spaceAfter=2
    )

    meta_label = ParagraphStyle(
        'MetaLabel',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=c_navy
    )

    meta_val = ParagraphStyle(
        'MetaVal',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10,
        textColor=c_text
    )

    story = []

    # ─────────────────────────────────────────────────────────────
    # PAGE 1: HEADER, SUMMARY, SECTIONS A - E
    # ─────────────────────────────────────────────────────────────
    story.append(Paragraph("Projektbericht & Dokumentation aller Optimierungen", title_style))
    story.append(Paragraph("Sarah Unke – Coaching-Praxis Website (su-coaching.de)", subtitle_style))

    # Meta Info Card Table
    date_now = datetime.now().strftime("%d.%m.%Y")
    meta_data = [
        [
            Paragraph("<b>Projekt:</b>", meta_label), Paragraph("Sarah Unke Coaching Website", meta_val),
            Paragraph("<b>Datum:</b>", meta_label), Paragraph(f"{date_now}", meta_val)
        ],
        [
            Paragraph("<b>Repository:</b>", meta_label), Paragraph("bene-s-dev/coachingtest (GitHub)", meta_val),
            Paragraph("<b>Status:</b>", meta_label), Paragraph("<font color='#1E6B24'><b>Vollständig umgesetzt & bereit</b></font>", meta_val)
        ],
        [
            Paragraph("<b>Technologie:</b>", meta_label), Paragraph("HTML5, Fluid CSS (Clamp), JS, Vite", meta_val),
            Paragraph("<b>Formular:</b>", meta_label), Paragraph("FormSubmit AJAX Backend (Live)", meta_val)
        ]
    ]

    meta_table = Table(meta_data, colWidths=[2.0 * cm, 6.7 * cm, 1.8 * cm, 6.9 * cm])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_light_bg),
        ('PADDING', (0,0), (-1,-1), 4),
        ('BOX', (0,0), (-1,-1), 1, c_border),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('TOPPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 6))

    # Management Summary
    story.append(Paragraph("1. Management Summary & Zielsetzung", h1_style))
    story.append(Paragraph(
        "Die Website von <b>Sarah Unke Coaching</b> wurde umfassend technisch und gestalterisch modernisiert. "
        "Ziel war ein harmonisches, zentriertes und responsives Gesamtbild auf allen Gerätegrößen (Smartphone, Tablet, Desktop), "
        "die Beseitigung störender visueller Elemente (wie Kanten-Striche und Klick-Hover auf reinen Textkarten), "
        "eine einheitliche Schreibweise ('Coaching-Praxis'), sanfte Scroll-Effekte sowie ein direkter, "
        "zuverlässiger Formularversand im Hintergrund ohne Umweg über externe Mailprogramme.",
        body_style
    ))
    story.append(Spacer(1, 4))

    # Detailed Changelog Part 1
    story.append(Paragraph("2. Detaillierte Dokumentation aller Änderungen", h1_style))

    story.append(Paragraph("A. Hero-Bereich & Header-Kompaktheit (Desktop & Mobile)", h2_style))
    story.append(Paragraph("• <b>Keine 100vh-Höhenblockade mehr:</b> Das Hintergrundfoto nimmt auf keinem Gerät mehr den vollen Bildschirm ein. Der Willkommenstext ist sofort 'Above-the-Fold' sichtbar.", bullet_style))
    story.append(Paragraph("• <b>Symmetrische Meeres-Ränder:</b> Sichtbare Abstände über und unter der Namenskarte sind exakt gleich ausbalanciert.", bullet_style))
    story.append(Paragraph("• <b>Breites Querformat:</b> 'SARAH UNKE' ist einzeilig (<code>white-space: nowrap</code>) neben dem Orca-Logo in einer schlanken, 640px breiten Karte platziert.", bullet_style))

    story.append(Paragraph("B. Navigation & Mobile Kopfzeile", h2_style))
    story.append(Paragraph("• <b>Schlanke Mobile-Leiste (48px):</b> Kopfzeile von 64px auf kompakte 48px reduziert für maximalen Nutzinhalt auf Smartphones.", bullet_style))
    story.append(Paragraph("• <b>Brand-Text auf Mobil:</b> Das Orca-Icon und der Name 'SARAH UNKE' werden nun auch auf Mobilgeräten immer in der Kopfzeile angezeigt.", bullet_style))
    story.append(Paragraph("• <b>Zentriertes Menü:</b> Alle Menüpunkte im aufklappbaren mobilen Hamburger-Menü sind horizontal exakt zentriert.", bullet_style))

    story.append(Paragraph("C. 'Mein Angebot' – Karten-Modernisierung & Hover-Bereinigung", h2_style))
    story.append(Paragraph("• <b>Strich-Entfernung:</b> Der markante blaue Oberkanten-Strich wurde durch einen dezenten Rundum-Rahmen (<code>1px solid rgba(58,124,165,0.14)</code>) ersetzt.", bullet_style))
    story.append(Paragraph("• <b>Zentrierte Ausrichtung:</b> Icons/Emojis, Titel und Untertitel sind mittig über den Angebotstexten ausgerichtet.", bullet_style))
    story.append(Paragraph("• <b>Hover-Bereinigung:</b> Alle Vergrößerungs- und Hebe-Effekte wurden von nicht-klickbaren Karten website-weit entfernt.", bullet_style))

    story.append(Paragraph("D. Typografie & Konsistenz", h2_style))
    story.append(Paragraph("• <b>Korrektes Wording:</b> Durchgängige Vereinheitlichung auf die Bindestrich-Schreibweise <b>'Coaching-Praxis'</b> über die gesamte Website.", bullet_style))

    story.append(Paragraph("E. Dynamische Scroll-Reveal Animationen", h2_style))
    story.append(Paragraph("• <b>Subtiler Einblend-Effekt:</b> Sanftes Hineingleiten aller Inhaltskarten beim Herunterscrollen (IntersectionObserver) für einen lebendigen Eindruck.", bullet_style))

    story.append(PageBreak())

    # ─────────────────────────────────────────────────────────────
    # PAGE 2: SECTIONS F - H, COMPARISON MATRIX, DEPLOYMENT
    # ─────────────────────────────────────────────────────────────
    story.append(Paragraph("Fortsetzung: Dokumentation aller Änderungen", h1_style))

    story.append(Paragraph("F. FAQ-Akkordeon & Honorar-Darstellung", h2_style))
    story.append(Paragraph("• <b>Sanftes Aufklappen:</b> Weicherer, langsamerer Öffnungs- und Schließ-Übergang für die FAQ-Antworten.", bullet_style))
    story.append(Paragraph("• <b>Finanz-Formatierung:</b> Preise einheitlich formatiert auf <b>120,- €</b> (Erstgespräch) und <b>100,- €</b> (Folgegespräche).", bullet_style))
    story.append(Paragraph("• <b>Vertikale Zentrierung & Platzoptimierung:</b> Preise vertikal mittig ausgerichtet. Auf Mobilgeräten wurde die überflüssige weiße Leerfläche der 2. Karte vollständig beseitigt.", bullet_style))

    story.append(Paragraph("G. Kontaktbereich & Formular-Automatisierung", h2_style))
    story.append(Paragraph("• <b>Hintergrund-Versand (FormSubmit AJAX):</b> Formular sendet Daten direkt via Fetch-API im Hintergrund – kein externes Mailprogramm mehr nötig.", bullet_style))
    story.append(Paragraph("• <b>Inline-Erfolgsmeldung:</b> Unmittelbare Bestätigung ('Vielen Dank! Ihre Nachricht wurde erfolgreich gesendet.') direkt unter dem Button.", bullet_style))
    story.append(Paragraph("• <b>Spam-Schutz:</b> Integriertes unsichtbares Honeypot-Feld zur Abwehr automatisierter Spam-Bots.", bullet_style))
    story.append(Paragraph("• <b>Calendly-Box Neugestaltung:</b> Hintergrund von Gelb/Sand auf zartes Meeres-Hellblau (<code>#f0f7fb</code>) mit durchgezogener Ozeanblau-Linie (<code>1px solid rgba(58,124,165,0.2)</code>) umgestellt.", bullet_style))

    story.append(Paragraph("H. Footer & Skalierbares Fluid-Container-System", h2_style))
    story.append(Paragraph("• <b>Kompakter Footer:</b> Stark reduzierte Höhe, zentriert auf Mobile, mit dezenten Links.", bullet_style))
    story.append(Paragraph("• <b>Fluid Container Architecture:</b> Vollständige Skalierbarkeit über CSS <code>clamp()</code> ohne starre Pixelgrenzen von 320px bis 4K.", bullet_style))
    story.append(Paragraph("• <b>iOS Zoom-Fix:</b> Formularfelder mit 16px Basisschriftgröße ausgestattet, um automatisches Hineinzoomen auf iPhones zu verhindern.", bullet_style))

    story.append(Spacer(1, 6))

    # Vorher / Nachher Matrix
    story.append(Paragraph("3. Vorher / Nachher Vergleichsmatrix", h1_style))

    table_data = [
        [
            Paragraph("<b>Bereich</b>", body_bold),
            Paragraph("<b>Ursprünglicher Zustand</b>", body_bold),
            Paragraph("<b>Optimierter Zustand</b>", body_bold)
        ],
        [
            Paragraph("<b>Hero-Bereich</b>", body_style),
            Paragraph("100vh Vollbildschirm, 'SARAH UNKE' zweizeilig umbrochen, ungleiche Meeresränder", body_style),
            Paragraph("Kompakt, Willkommenstext sofort im Blick, Name einzeilig im Breitformat (640px)", body_style)
        ],
        [
            Paragraph("<b>Mobile Header</b>", body_style),
            Paragraph("64px hoch, Markenname ausgeblendet, linksbündiges Menü", body_style),
            Paragraph("48px schlank, Logo + Name immer sichtbar, Menüpunkte mittig zentriert", body_style)
        ],
        [
            Paragraph("<b>Angebots-Karten</b>", body_style),
            Paragraph("Blauer Oberkanten-Strich, Hover-Hebeeffekt bei nicht-klickbarem Inhalt", body_style),
            Paragraph("Subtiler Rundum-Rahmen, zentrierte Badges, statisch ohne Klick-Täuschung", body_style)
        ],
        [
            Paragraph("<b>Preise (FAQ)</b>", body_style),
            Paragraph("'120 €' obenbündig, mobil mit riesigem Leerbereich in der 2. Karte", body_style),
            Paragraph("'120,- €' vertikal zentriert, mobil als kompakte, passgenaue Zeile", body_style)
        ],
        [
            Paragraph("<b>Kontaktformular</b>", body_style),
            Paragraph("Öffnet lokales Mailprogramm (mailto:), gelbliche Buchungs-Box", body_style),
            Paragraph("Echter Hintergrund-Versand mit Erfolgsmeldung, hellblaue Box mit durchgezogenem Rand", body_style)
        ],
        [
            Paragraph("<b>Wording</b>", body_style),
            Paragraph("Uneinheitliche Schreibweise ('Coaching Praxis')", body_style),
            Paragraph("Standardisiert auf 'Coaching-Praxis' auf allen Seiten", body_style)
        ]
    ]

    comp_table = Table(table_data, colWidths=[3.0 * cm, 6.7 * cm, 7.7 * cm])
    comp_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_sand),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 3.5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_light_bg]),
    ]))
    story.append(comp_table)
    story.append(Spacer(1, 6))

    # Technical Infrastructure
    story.append(Paragraph("4. Technische Infrastruktur & GitHub-Status", h1_style))
    story.append(Paragraph(
        "• <b>Git & Repository:</b> Alle Änderungen sind lokal im Projektverzeichnis eingepflegt. Du kannst deine Commits und Pushes eigenständig ausführen.<br/>"
        "• <b>FormSubmit-Aktivierung:</b> Beim ersten Testen sendet FormSubmit eine Aktivierungs-E-Mail an <b>mail@su-coaching.de</b>. Nach einmaliger Bestätigung ist der Versand dauerhaft aktiv.<br/>"
        "• <b>Lokaler Dev-Server:</b> Entwicklungs-Server läuft stabil über Vite mit Hot-Reloading unter <code>http://localhost:5173</code>.",
        body_style
    ))

    # Build document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF successfully generated at: {output_filename}")


if __name__ == "__main__":
    output_pdf = "/Users/benedikt/Desktop/sarah_website/coachingtest/Aenderungsbericht_Sarah_Unke_Website.pdf"
    create_change_report(output_pdf)
