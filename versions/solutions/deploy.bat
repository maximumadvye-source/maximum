@echo off
cd maximum-main || exit /b 1
vercel --prod %*
