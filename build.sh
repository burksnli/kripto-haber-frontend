#!/bin/bash
npm run build
cp public/_redirects dist/_redirects
cp vercel.json dist/vercel.json

