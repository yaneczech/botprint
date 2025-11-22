# Příklady

Tato složka obsahuje příklady, jak používat Niimbot Printer App.

## Soubory

### sample-data.csv
Příklad CSV dat pro hromadný tisk jmenovek.

**Použití:**
1. Otevřete soubor v Excelu a upravte podle potřeby
2. Uložte jako .xlsx
3. V aplikaci klikněte na "📊 Import z Excelu"
4. Vyberte uložený soubor

**Struktura:**
- `Jméno` - jméno osoby
- `Pozice` - pracovní pozice
- `Email` - emailová adresa
- `Telefon` - telefonní číslo

## Návody

### 1. Jmenovky pro konferenci

**Potřebujete:**
- CSV/Excel soubor s účastníky
- Logo konference (SVG nebo PNG)

**Postup:**
1. Importujte logo (🖼️ Importovat obrázek)
2. Přidejte textová pole: "Jméno", "Pozice", "Firma"
3. Uspořádejte je na štítku
4. Importujte Excel data (📊 Import z Excelu)
5. Vytiskněte všechny jmenovky

### 2. Skladové štítky

**Potřebujete:**
- Excel s produkty (SKU, Název, Cena)

**Postup:**
1. Vytvořte textová pole: "SKU", "Název", "Cena"
2. Přidejte QR kód jako obrázek (vygenerujte online)
3. Importujte data z Excelu
4. Tisk

### 3. Adresní štítky

**Potřebujete:**
- Excel s adresami

**Příklad struktury Excel:**
```
Příjemce,Ulice,Město,PSČ
Jan Novák,Hlavní 123,Praha,110 00
```

**Postup:**
1. Vytvořte textová pole s názvy sloupců
2. Uspořádejte jako adresu
3. Import a tisk

### 4. Dárkové štítky

**Postup:**
1. Importujte vánoční SVG grafiku
2. Přidejte text "Pro:", "Od:"
3. Použijte vánoční font (nahrajte TTF)
4. Uložte jako šablonu
5. Použijte opakovaně

## Tipy

### Vytváření šablon

1. Vytvořte design jednou
2. Uložte jako JSON (💾 Uložit)
3. Při dalším použití načtěte (📂 Otevřít)
4. Pouze naimportujte nová data

### Optimalizace pro tisk

- **Velikost textu**: minimálně 12pt pro čitelnost
- **Hustota tisku**: 3-4 pro většinu případů
- **Margins**: nechte 2-3mm okraje od kraje štítku

### Hromadný tisk

Pro více než 10 štítků:
1. Otestujte design na 1 štítku
2. Zkontrolujte kvalitu tisku
3. Případně upravte hustotu
4. Pak spusťte hromadný tisk

## Zdroje

### Kde vzít SVG grafiku

- [Undraw](https://undraw.co) - ilustrace zdarma
- [Font Awesome](https://fontawesome.com) - ikony
- [Heroicons](https://heroicons.com) - SVG ikony
- [Flaticon](https://www.flaticon.com) - různé ikony

### Kde vzít fonty

- [Google Fonts](https://fonts.google.com) - zdarma
- [Font Squirrel](https://www.fontsquirrel.com) - komerčně použitelné
- [DaFont](https://www.dafont.com) - různé styly

### QR kódy a čárové kódy

- [QR Code Generator](https://www.qr-code-generator.com)
- [Barcode Generator](https://barcode.tec-it.com)

Vygenerujte jako PNG a importujte do aplikace.

---

Máte vlastní příklad? Přispějte pull requestem!
