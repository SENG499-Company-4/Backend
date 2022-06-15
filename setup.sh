#!/bin/sh
npm run migrate
npx prisma db seed
npm run dev