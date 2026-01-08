 Sklep internetowy – projekt zaliczeniowy

Projekt wykonany w ramach zajęć z Aplikacji Webowych.

Autor: Mikołaj Wałek

Opis projektu:

Prosty sklep internetowy umożliwiający:
- przeglądanie produktów
- dodawanie produktów do koszyka
- składanie zamówień
- przegląd historii zamówień
- dodawanie opinii o produktach

Projekt składa się z części **frontendowej oraz **backendowej.

Technologie:

Frontend:
- React
- TypeScript
- Vite

Backend:
- NestJS
- Prisma ORM
- SQLite
- JWT 

Funkcjonalności:
- role użytkowników (USER / ADMIN)
- koszyk (localStorage)
- składanie zamówień
- historia zamówień
- opinie o produktach 
- administrator może usuwać dowolne opinie

Uruchomienie projektu

Backend:

cd backend
npm install
npm run start:dev

Backend działa pod adresem:
http://localhost:3000

Frontend:
cd frontend
npm install
npm run dev


Frontend działa pod adresem:
http://localhost:5173

 Podgląd bazy danych (Prisma Studio):

Aby otworzyć bazę danych w przeglądarce:

cd backend
npx prisma studio
