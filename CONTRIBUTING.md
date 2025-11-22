# Přispívání k projektu

Děkujeme za váš zájem přispět k Niimbot Printer App! Tato příručka vám pomůže začít.

## Jak přispět

### Hlášení chyb

Našli jste chybu? Pomozte nám ji opravit:

1. **Zkontrolujte existující issues** - možná už někdo stejnou chybu hlásil
2. **Vytvořte nové issue** s následujícími informacemi:
   - Stručný a výstižný název
   - Podrobný popis chyby
   - Kroky k reprodukci
   - Očekávané chování
   - Skutečné chování
   - Screenshoty (pokud je to relevantní)
   - Informace o systému (OS, verze aplikace)

### Návrhy funkcí

Máte nápad na novou funkci?

1. **Otevřete issue** s označením "feature request"
2. Popište:
   - Co chcete dosáhnout
   - Proč by to bylo užitečné
   - Jak by to mělo fungovat (návrh UX)

### Pull requesty

Chcete přispět kódem? Skvělé!

#### Před začátkem

1. Otevřete issue pro diskuzi o změně (pokud ještě neexistuje)
2. Forkněte repozitář
3. Vytvořte novou větev (`git checkout -b feature/amazing-feature`)

#### Během vývoje

1. **Dodržujte coding style projektu**
   - TypeScript strict mode
   - ESLint pravidla
   - Prettier formátování

2. **Pište čitelný kód**
   - Smysluplné názvy proměnných
   - Komentáře pro složitou logiku
   - Funkce dělají jednu věc dobře

3. **Testujte své změny**
   - Manuální testování
   - Zkuste různé scénáře
   - Testujte na různých OS (pokud možno)

#### Vytvoření PR

1. Commitněte změny (`git commit -m 'feat: Add amazing feature'`)
2. Pushněte do větve (`git push origin feature/amazing-feature`)
3. Otevřete Pull Request

#### Commit messages

Používáme [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - nová funkce
- `fix:` - oprava chyby
- `docs:` - změny v dokumentaci
- `style:` - formátování, whitespace
- `refactor:` - refaktoring kódu
- `test:` - přidání testů
- `chore:` - údržba, aktualizace závislostí

Příklady:
```
feat: add QR code support
fix: bluetooth connection timeout on Windows
docs: update installation instructions
refactor: simplify printer protocol handling
```

## Vývoj

### Nastavení prostředí

```bash
# Klonování repozitáře
git clone https://github.com/yourusername/botprint.git
cd botprint

# Instalace závislostí
npm install

# Spuštění v dev módu
npm run electron:dev
```

### Struktura projektu

```
botprint/
├── electron/              # Backend (Node.js + Electron)
│   ├── main.ts           # Hlavní proces
│   ├── preload.ts        # Preload skript
│   └── niimbot/          # Niimbot logika
├── src/                  # Frontend (React)
│   ├── components/       # React komponenty
│   └── types/            # TypeScript typy
└── tests/                # Testy
```

### Kódovací standardy

#### TypeScript

```typescript
// ✅ Dobře
interface PrinterInfo {
  model: string
  serialNumber: string
  batteryLevel: number
}

function connectPrinter(deviceId: string): Promise<boolean> {
  // ...
}

// ❌ Špatně
function connect(id: any) {
  // ...
}
```

#### React komponenty

```typescript
// ✅ Dobře
interface ToolbarProps {
  onSave: () => void
  onLoad: () => void
}

export default function Toolbar({ onSave, onLoad }: ToolbarProps) {
  // ...
}

// ❌ Špatně
export default function Toolbar(props: any) {
  // ...
}
```

#### CSS/Tailwind

```tsx
// ✅ Dobře - používejte Tailwind utility classes
<button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
  Tisknout
</button>

// ❌ Špatně - inline styles
<button style={{padding: '8px 16px', background: 'blue'}}>
  Tisknout
</button>
```

### Testování

Před odesláním PR otestujte:

1. **Základní funkčnost**
   - Vytvoření jednoduchého štítku
   - Import obrázku/SVG
   - Uložení a načtení designu

2. **Specifické pro vaši změnu**
   - Test nové funkce
   - Regresní test - ujistěte se, že jste nic nerozbili

3. **Různé platformy** (pokud možno)
   - macOS
   - Windows
   - Linux

### Dokumentace

Pokud přidáváte novou funkci:

1. **Aktualizujte README.md**
   - Přidejte do seznamu funkcí
   - Přidejte do sekce "Jak používat"

2. **Aktualizujte TUTORIAL.md**
   - Přidejte praktický návod

3. **Komentáře v kódu**
   - Dokumentujte složité části
   - JSDoc pro veřejné API

## Prioritní oblasti pro přispění

Hledáme pomoc s:

1. **USB komunikace**
   - Implementace USB adaptéru jako alternativa k Bluetooth
   - Testování na různých OS

2. **Bluetooth na Linuxu**
   - Vyřešení problémů s oprávněními
   - Integrace s BlueZ

3. **Testování**
   - Unit testy pro protokol
   - E2E testy
   - Testování na reálných Niimbot tiskárnách

4. **Lokalizace**
   - Překlad do angličtiny
   - Překlad do dalších jazyků

5. **Nové funkce**
   - QR kódy a čárové kódy
   - Šablony štítků
   - Batch printing

## Code Review proces

1. Maintainer zkontroluje váš PR
2. Může požádat o změny nebo vysvětlení
3. Po schválení bude PR mergnut
4. Vaše změna se objeví v další verzi

## Otázky?

Neváhejte se zeptat:
- Otevřete issue s označením "question"
- Nebo přímo v diskuzi k PR

## Kodex chování

- Buďte přátelští a respektující
- Konstruktivní kritika je vítána
- Nepřijatelné je:
  - Urážky a osobní útoky
  - Trolling
  - Obtěžování

## Licence

Přispíváním souhlasíte s tím, že váš kód bude licencován pod MIT licencí.

---

Těšíme se na vaši spolupráci! 🎉
