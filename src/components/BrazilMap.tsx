import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Globe, BookOpen, PlayCircle, ShieldCheck, Compass, Lock } from 'lucide-react';
import { SubjectCategory } from '../types';
import { audioEngine } from '../lib/audioEngine';

interface BrazilMapProps {
  currentFase: number;
  onLaunchCategory: (category: SubjectCategory, regionName: string) => void;
}

interface CommandRegion {
  id: string;
  name: string;
  category: SubjectCategory;
  short: string;
  topic: string;
  /**
   * SVG path gerado a partir de dados GeoJSON reais dos estados brasileiros
   * (IBGE), agrupados por Comando Militar de Área conforme Decreto nº 3.213/1999
   * e Decreto nº 8.053/2013.
   *
   * Projeção: equirretangular
   *   lon ∈ [-73.990, -32.391]  →  x ∈ [20, 480]  (W = 460 px)
   *   lat ∈ [ 5.271, -33.751]  →  y ∈ [20, 580]  (H = 560 px)
   *   x = (lon − LON_MIN) / (LON_MAX − LON_MIN) × 460 + 20
   *   y = (LAT_MAX − lat) / (LAT_MAX − LAT_MIN) × 560 + 20
   *
   * Simplificação: Ramer–Douglas–Peucker, ε = 1.5 px de tela
   */
  path: string;
  /** Centro aproximado da região para o rótulo */
  labelX: number;
  labelY: number;
  /** Posição do ponto de capital */
  dotX: number;
  dotY: number;
  color: string;
  unlockedAtFase: number;
  description: string;
  missionsCount: number;
}

// ---------------------------------------------------------------------------
// Mapeamento oficial (Decreto 3.213/1999 + Decreto 8.053/2013):
//   CMA  (12ª RM): AM, AC, RR, RO
//   CMN  ( 8ª RM): PA, AP, MA
//   CMNE (6ª+7ª+10ª RM): BA, SE, AL, PE, PB, RN, CE, PI
//   CMP  (11ª RM): DF, GO, TO (+ Triângulo Mineiro)
//   CMO  ( 9ª RM): MS, MT
//   CML  (1ª+4ª RM): RJ, ES, MG
//   CMSE ( 2ª RM): SP
//   CMS  (3ª+5ª RM): RS, PR, SC
// ---------------------------------------------------------------------------

const CMA_PATH = `M 24.2,199.0 34.7,205.1 60.0,212.5 101.4,238.2 89.5,249.3 85.6,248.8 80.2,255.1 70.5,252.4 57.3,253.5 58.7,230.9 50.7,238.7 40.0,239.1 38.1,231.9 28.6,230.7 31.6,224.6 20.0,204.1 20.3,201.1 23.2,200.5 22.1,197.7 24.2,199.0 Z M 93.7,66.5 96.2,70.8 96.3,78.9 98.9,78.0 104.8,84.8 112.9,81.2 113.4,86.3 118.3,79.0 126.1,73.7 126.7,76.1 130.5,67.2 140.0,64.5 144.8,67.8 143.7,72.8 147.7,81.6 146.7,88.3 150.5,100.4 147.0,106.5 153.7,115.7 158.4,118.3 157.2,109.1 161.3,102.8 164.5,103.6 167.3,108.5 171.3,106.0 170.3,103.0 174.3,91.9 186.9,91.9 187.2,100.6 193.2,112.0 195.0,113.3 196.6,111.5 197.3,115.8 206.1,120.3 211.4,127.4 217.8,124.7 213.8,130.4 191.5,191.8 195.3,201.2 192.6,208.1 192.2,221.8 157.2,221.9 155.8,220.3 152.8,223.1 143.2,210.2 134.7,210.0 128.8,224.2 121.2,224.7 118.3,231.0 116.7,228.5 110.7,233.2 108.7,230.7 103.8,230.6 99.4,236.5 60.0,212.5 34.7,205.1 22.1,197.7 23.8,192.7 29.4,188.9 28.3,182.2 33.0,169.0 43.3,160.5 53.7,158.6 56.9,154.9 60.5,155.1 61.9,158.3 64.5,157.4 70.8,111.9 68.4,102.9 63.5,98.3 63.7,87.6 69.9,85.1 73.9,86.3 72.3,80.4 65.9,80.1 65.9,70.9 84.5,70.8 83.9,67.5 86.9,69.4 92.8,63.4 93.7,66.5 Z M 103.3,237.4 99.4,236.5 103.8,230.6 108.7,230.7 110.7,233.2 116.7,228.5 118.3,231.0 121.2,224.7 128.8,224.2 134.7,210.0 144.4,211.1 151.2,221.9 153.6,223.0 155.8,220.3 158.5,223.6 156.7,228.6 158.4,233.8 157.6,253.3 175.0,255.3 173.5,265.5 177.2,272.7 170.4,288.7 166.8,292.2 163.5,289.2 154.4,290.1 150.7,283.8 144.0,282.3 139.8,276.7 125.9,274.2 116.5,263.6 115.4,235.0 103.3,237.4 Z M 175.6,50.5 177.5,68.9 187.0,77.6 186.9,91.9 174.3,91.9 170.3,103.0 171.4,105.8 168.8,108.2 162.7,102.8 158.9,104.7 156.7,114.3 158.3,118.3 147.0,106.5 150.5,100.4 146.7,88.3 147.4,80.0 143.7,72.8 144.8,67.8 137.6,64.1 137.0,60.7 129.9,59.8 128.4,44.6 121.4,34.5 128.7,36.4 130.9,40.1 134.0,38.0 136.0,40.5 139.3,38.9 142.0,43.9 144.4,42.7 144.3,37.7 147.8,35.6 153.4,36.8 160.1,30.6 163.7,30.8 168.2,24.9 166.7,20.7 172.4,20.0 174.8,24.1 172.9,30.9 178.3,32.9 180.0,39.1 176.2,44.3 175.6,50.5 Z`;

const CMN_PATH = `M 272.2,38.1 277.5,65.0 280.3,64.1 282.7,69.8 286.2,71.2 286.5,78.5 284.2,85.6 280.8,86.7 277.9,93.0 271.8,97.3 266.4,111.0 262.4,113.4 258.4,110.7 257.4,104.1 252.8,97.6 247.4,77.8 237.6,70.7 232.8,70.2 231.4,60.8 236.2,63.9 243.6,61.5 252.7,64.5 257.0,59.5 268.3,32.1 272.2,38.1 Z M 318.1,224.6 324.4,211.4 322.8,209.0 318.0,211.2 311.9,202.4 312.9,200.3 310.2,199.0 314.3,185.6 312.9,174.9 303.4,169.8 299.1,172.4 311.7,161.0 317.5,151.0 326.4,126.5 327.8,113.2 329.9,110.7 330.1,113.4 331.2,110.6 332.6,115.8 336.0,114.1 335.3,117.7 337.1,114.6 336.7,120.6 339.5,115.2 339.7,117.4 342.6,116.0 341.7,118.8 344.5,118.9 342.6,121.7 345.1,120.7 348.0,131.5 351.4,130.1 351.8,132.6 355.9,127.5 368.4,134.6 375.7,134.7 376.0,138.2 371.5,144.9 368.2,145.1 362.8,156.4 364.9,170.0 361.6,176.5 364.6,186.6 363.6,191.4 358.0,193.9 354.8,191.8 351.0,192.8 344.0,201.8 335.4,206.0 329.6,223.7 331.9,231.7 330.1,242.9 325.4,241.6 322.4,235.3 323.3,231.7 318.1,224.6 Z M 319.0,106.2 321.3,108.8 322.5,106.9 322.0,109.6 324.8,107.9 324.8,110.9 327.4,108.5 326.5,112.5 328.7,110.3 326.4,126.5 312.0,160.5 299.1,172.4 305.9,176.0 304.8,181.0 300.0,191.3 294.0,195.0 292.1,203.9 294.7,207.6 294.0,213.2 284.9,228.9 282.8,236.9 210.5,230.6 201.3,221.3 200.8,213.5 191.5,191.8 213.8,130.4 217.8,124.7 211.4,127.4 206.1,120.3 197.3,115.8 196.6,111.5 195.0,113.3 192.1,110.4 187.2,100.6 186.9,78.0 191.3,77.4 193.3,72.7 196.8,74.1 196.9,71.8 201.9,71.2 204.5,66.9 219.4,69.2 217.4,63.1 219.2,59.4 225.7,60.9 230.5,58.6 232.8,70.2 237.6,70.7 247.4,77.8 252.8,97.6 257.4,104.1 258.4,110.7 262.1,113.2 266.4,111.0 271.8,97.3 283.5,85.5 284.6,90.8 288.9,90.4 297.1,98.9 302.8,99.3 302.2,102.8 307.5,105.8 310.7,103.3 313.1,106.6 313.5,104.1 319.0,106.2 Z`;

const CMNE_PATH = `M 446.0,222.3 449.1,224.5 435.8,246.3 429.1,238.8 415.4,229.5 420.6,222.8 429.6,230.3 437.6,227.2 439.4,223.6 446.0,222.3 Z M 403.7,218.5 410.6,224.4 411.9,222.2 414.7,225.1 420.9,243.9 420.0,249.1 415.6,249.3 415.4,252.3 420.0,260.9 425.2,259.9 417.4,277.0 407.3,286.3 406.2,306.7 408.5,323.2 404.6,342.0 405.4,349.5 399.5,359.0 393.4,353.7 393.4,350.1 389.0,345.4 390.4,337.9 392.7,338.2 392.8,333.5 397.4,326.9 393.3,322.4 386.8,320.2 381.1,321.6 376.0,312.3 372.7,313.6 360.7,305.9 356.8,308.2 352.9,305.9 354.0,301.4 349.3,299.9 328.7,314.7 330.5,301.6 326.6,298.0 326.8,288.4 329.1,286.2 326.0,286.5 328.3,281.0 326.1,281.5 327.8,274.8 325.1,268.4 327.6,266.4 325.4,266.0 326.0,262.6 328.6,262.6 324.2,260.9 322.7,257.6 333.9,240.7 337.8,250.9 341.3,252.5 345.2,248.1 350.1,248.3 355.4,239.2 353.3,232.7 357.3,228.6 365.3,233.6 375.5,228.3 380.6,220.6 383.5,220.5 388.5,227.1 387.3,231.3 389.0,231.7 399.3,219.9 403.7,218.5 Z M 395.7,136.4 412.8,148.8 426.3,165.0 422.0,166.3 416.2,181.0 411.6,185.8 409.5,196.0 412.1,200.3 407.3,208.2 399.6,200.5 389.8,201.7 391.8,193.3 387.8,191.1 385.6,170.0 382.1,165.5 383.8,155.5 380.1,144.0 381.2,137.6 395.7,136.4 Z M 426.5,182.2 423.7,191.9 426.4,193.6 430.9,192.2 432.1,195.8 435.7,186.0 440.3,188.8 451.5,188.7 453.1,204.0 450.3,201.8 445.9,202.5 445.3,205.5 435.4,207.8 429.1,214.8 426.9,209.9 425.1,210.1 429.2,203.0 426.5,200.0 417.1,208.0 414.0,205.8 411.4,206.9 410.0,204.8 412.1,200.3 409.5,196.0 411.3,187.3 416.7,189.2 426.5,182.2 Z M 427.1,200.5 429.2,203.0 425.1,210.1 426.9,209.9 429.1,214.8 435.4,207.8 445.3,205.5 445.9,202.5 450.3,201.8 452.9,203.9 449.5,223.6 441.2,222.7 437.6,227.2 429.6,230.3 420.6,222.8 415.4,229.5 412.7,222.6 410.9,224.6 402.7,218.1 389.0,231.7 385.7,222.4 380.8,220.6 389.3,212.4 388.0,202.9 389.8,201.7 399.6,200.5 405.9,208.4 410.1,205.0 417.1,208.0 427.1,200.5 Z M 376.6,135.9 382.0,138.8 380.1,144.0 383.8,155.5 382.1,165.5 385.6,170.0 387.8,191.1 391.8,193.3 388.0,202.9 389.3,212.4 374.7,228.8 364.9,233.7 357.8,228.6 354.2,231.1 355.4,239.2 352.5,245.2 350.0,248.3 345.1,248.2 341.3,252.5 336.6,249.7 334.0,240.7 330.1,242.9 331.9,231.7 330.0,222.2 336.2,204.9 344.0,201.8 351.3,192.7 358.0,193.9 363.6,191.4 364.6,186.6 361.6,176.5 364.9,170.0 362.8,156.4 368.2,145.1 371.5,144.9 376.6,135.9 Z M 427.4,166.5 445.7,169.7 451.5,188.7 440.3,188.8 435.7,186.0 432.1,195.8 430.9,192.2 426.4,193.6 423.7,191.9 427.1,182.4 420.8,184.5 416.7,189.2 411.6,186.7 422.0,166.3 427.4,166.5 Z M 418.4,232.4 429.1,238.8 435.7,246.3 430.7,249.8 425.4,259.9 421.6,261.6 418.2,259.1 415.3,251.7 415.6,249.3 420.0,249.1 420.9,243.9 418.0,237.9 418.4,232.4 Z`;

const CMP_PATH = `M 283.5,273.8 282.0,279.9 292.3,286.1 295.0,279.2 296.6,281.6 298.0,279.5 300.9,286.8 301.8,284.0 302.5,286.4 305.5,284.3 305.6,286.6 311.0,288.9 311.4,283.7 313.7,286.3 324.5,281.8 324.9,279.7 325.5,282.1 328.3,281.0 325.9,283.6 326.4,287.2 329.1,286.2 326.8,288.4 326.6,298.0 330.5,301.6 328.5,310.0 324.0,306.7 324.0,311.6 319.3,311.7 320.5,323.6 314.9,325.8 313.8,318.1 305.2,318.1 304.3,326.0 315.1,326.1 313.4,332.5 317.1,339.3 312.5,346.1 315.5,348.3 315.3,354.8 307.9,361.1 297.0,358.3 292.2,363.2 290.4,361.0 281.9,364.0 276.0,375.5 258.2,363.9 253.0,363.1 254.8,359.0 251.0,358.4 249.4,347.2 252.0,337.6 256.2,332.9 255.6,329.6 260.4,323.7 264.5,322.7 268.3,311.9 273.3,309.7 275.6,292.7 280.0,278.0 283.5,273.8 Z M 318.1,224.5 323.3,231.7 322.4,235.3 325.4,241.6 332.8,241.5 322.7,257.6 324.2,260.9 328.6,262.4 326.0,262.6 325.4,266.0 327.6,266.4 325.1,268.4 327.8,274.8 326.1,281.5 328.2,281.1 325.5,282.1 324.9,279.7 324.5,281.8 313.7,286.3 311.4,283.7 311.0,288.9 305.6,286.6 305.5,284.3 302.5,286.4 301.8,284.0 300.9,286.8 297.9,279.4 296.6,281.6 295.0,279.2 293.7,280.5 292.3,286.1 282.0,279.9 283.7,273.5 278.4,279.6 278.6,248.6 284.9,228.9 293.2,215.9 294.7,207.6 292.1,203.9 294.0,195.0 303.2,187.2 305.9,176.3 303.1,173.0 299.2,172.7 301.7,170.1 308.1,170.8 312.9,174.9 314.3,185.6 310.2,199.0 312.9,200.3 311.9,202.4 318.0,211.2 322.8,209.0 324.2,210.6 318.1,224.5 Z M 315.0,325.8 304.3,326.0 305.2,318.1 313.8,318.1 315.0,325.8 Z`;

const CMO_PATH = `M 242.4,352.8 251.3,354.5 251.3,358.9 254.8,359.0 253.0,363.1 257.3,363.4 273.6,373.0 274.2,384.0 267.7,391.8 258.7,413.4 245.4,425.0 239.6,439.8 237.9,441.1 233.6,437.4 226.2,440.0 220.6,415.4 216.6,415.3 214.6,412.4 209.6,415.7 196.9,412.7 198.8,396.2 195.0,385.1 198.4,382.2 195.4,379.2 202.9,357.3 199.1,347.6 202.9,352.6 207.4,350.1 210.8,344.0 217.7,342.0 228.6,349.0 234.6,346.3 237.7,349.1 244.3,342.9 242.4,352.8 Z M 170.7,286.5 177.2,272.7 173.5,265.5 175.0,255.3 157.6,253.3 157.2,221.9 192.2,221.8 192.6,208.1 195.3,201.1 200.8,213.5 201.3,221.3 210.5,230.6 282.8,236.9 277.1,259.7 277.5,276.6 279.7,280.5 273.3,309.7 268.3,311.9 264.5,322.7 260.4,323.7 255.6,329.6 256.1,333.2 249.7,343.9 251.3,354.5 241.6,352.9 244.3,349.1 244.3,342.9 240.1,348.5 237.3,349.1 234.6,346.3 228.6,349.0 217.7,342.0 210.8,344.0 207.4,350.1 202.9,352.6 199.8,347.2 196.3,346.7 192.5,342.2 193.3,329.0 172.8,329.1 172.1,317.7 168.5,312.5 172.0,312.3 170.5,296.4 166.8,292.0 170.7,286.5 Z`;

const CML_PATH = `M 387.9,394.7 385.3,401.4 376.9,398.8 375.3,388.0 376.4,385.6 380.6,385.4 385.4,375.1 384.6,367.9 382.1,366.2 385.7,365.7 383.0,358.4 387.3,356.2 386.1,353.5 390.0,352.4 399.5,358.7 399.3,372.7 391.2,391.8 387.9,394.7 Z M 349.3,300.1 354.0,301.4 352.9,305.9 356.8,308.2 360.7,305.9 372.7,313.6 376.0,312.3 381.1,321.6 388.0,320.5 396.8,325.3 389.0,345.4 393.9,351.8 393.4,353.7 386.1,353.5 387.3,356.2 383.0,358.4 385.7,365.7 382.1,366.2 384.6,367.9 385.4,374.9 380.6,385.4 375.4,387.4 370.7,407.3 361.9,412.7 354.2,412.3 336.2,420.7 332.6,419.7 331.8,423.7 325.7,424.3 325.0,419.1 321.5,415.8 323.9,403.7 318.3,403.1 315.8,395.4 317.4,391.9 313.3,382.1 298.3,385.0 297.5,389.0 296.4,385.0 293.9,387.0 293.6,382.2 290.2,381.3 280.1,379.5 274.2,383.9 273.8,378.2 281.9,364.0 290.4,361.0 292.2,363.2 297.0,358.3 307.9,361.1 315.3,354.8 315.5,348.3 312.5,345.2 317.1,339.3 313.4,332.0 315.1,325.5 320.5,323.6 319.3,311.7 324.0,311.6 324.0,306.7 326.3,309.9 329.5,309.5 328.7,314.7 349.3,300.1 Z M 346.0,429.9 342.0,429.3 342.8,425.7 349.9,421.1 344.6,420.1 342.9,416.9 354.2,412.3 361.9,412.7 370.7,407.3 372.1,396.6 375.1,393.7 376.9,398.8 385.0,401.0 385.0,411.3 374.2,419.0 373.6,425.7 362.1,425.5 361.7,421.1 359.5,422.8 360.7,425.5 356.6,426.8 353.4,424.3 349.5,426.5 347.1,424.9 344.0,426.9 346.0,429.9 Z`;

const CMSE_PATH = `M 328.0,438.0 319.1,444.1 306.3,458.9 304.6,454.1 301.0,455.1 301.0,449.7 293.0,449.7 294.1,445.0 289.6,437.9 288.8,428.1 285.4,424.2 277.1,425.1 271.3,421.0 262.0,418.8 260.7,421.0 250.9,419.9 258.7,413.4 267.7,391.8 278.9,380.0 293.4,382.1 293.7,386.8 296.4,385.0 297.5,389.0 298.3,385.0 313.2,382.1 315.9,385.8 318.3,403.1 323.9,403.7 321.5,415.8 325.0,419.1 325.5,424.2 331.8,423.7 332.6,419.7 336.2,420.7 342.7,417.2 344.6,420.1 349.8,421.0 342.9,425.4 341.8,428.9 343.6,431.0 336.1,434.6 336.1,437.5 328.0,438.0 Z`;

const CMS_PATH = `M 262.5,419.0 271.3,421.0 277.1,425.1 285.4,424.2 288.3,427.3 289.6,437.9 294.1,445.0 293.0,449.7 301.0,449.7 301.2,455.6 304.6,454.1 307.1,457.7 300.9,468.4 294.4,468.8 290.2,472.2 285.9,468.9 281.7,470.7 279.0,468.8 277.3,472.3 271.5,473.4 269.7,479.0 261.1,475.1 246.0,473.0 242.2,463.3 240.0,461.5 236.3,464.4 234.5,462.9 237.3,441.9 245.4,425.0 252.4,419.5 260.7,421.0 262.5,419.0 Z M 262.7,548.7 260.3,552.7 262.1,557.2 256.2,570.9 247.5,580.0 247.3,571.4 250.7,566.2 254.9,567.2 256.3,556.9 251.3,564.3 247.8,563.3 243.9,556.0 234.6,547.1 227.4,544.2 223.6,538.1 218.8,541.7 218.7,537.4 210.0,527.7 207.1,527.4 205.4,530.3 200.8,528.9 220.4,502.6 222.3,503.6 221.5,500.9 229.6,495.4 232.1,490.7 238.0,489.5 242.4,484.9 245.0,486.3 248.0,484.4 248.7,486.2 251.8,484.3 252.4,486.3 261.3,487.0 273.3,495.1 278.4,503.1 288.3,504.9 283.4,515.4 288.5,516.5 276.8,542.1 262.3,557.1 262.1,552.5 264.8,553.0 271.6,547.1 272.4,541.5 277.5,536.9 277.4,531.2 278.9,533.1 278.7,529.0 275.0,532.4 271.0,526.2 271.0,530.5 273.2,531.6 271.0,536.9 269.9,535.6 269.4,541.8 263.9,545.1 262.8,550.5 262.7,548.7 Z M 244.1,476.8 245.0,472.4 249.0,472.3 268.6,477.1 269.7,479.0 271.5,473.4 277.3,472.3 279.0,468.8 281.7,470.7 285.9,468.9 290.2,472.2 294.4,468.8 300.3,468.1 302.0,471.9 299.9,479.2 302.3,485.2 299.0,505.2 288.5,516.5 285.7,514.7 284.6,516.7 287.9,504.1 278.4,503.1 273.3,495.1 261.3,487.0 252.4,486.3 251.8,484.3 248.7,486.2 248.0,484.4 242.9,485.5 244.1,476.8 Z`;

export const BrazilMap: React.FC<BrazilMapProps> = ({ currentFase, onLaunchCategory }) => {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<CommandRegion | null>(null);

  const REGIONS: CommandRegion[] = [
    {
      id: 'cma',
      name: 'Comando Militar da Amazônia (Manaus - AM)',
      short: 'CMA',
      category: 'Geografia',
      topic: 'Bacias Hidrográficas, Biomas de Fronteira e Recursos Naturais',
      path: CMA_PATH,
      labelX: 100, labelY: 175, dotX: 120, dotY: 195,
      color: '#1E4620',
      unlockedAtFase: 1,
      description: 'Zelo pela soberania da Amazônia ocidental. Responda pautas cruciais de geografia física, hidrografia e faunas de fronteira.',
      missionsCount: 5,
    },
    {
      id: 'cmn',
      name: 'Comando Militar do Norte (Belém - PA)',
      short: 'CMN',
      category: 'Legislação',
      topic: 'Código Penal Militar (CPM) e Processo Penal Militar',
      path: CMN_PATH,
      labelX: 272, labelY: 145, dotX: 308, dotY: 185,
      color: '#3C4D3D',
      unlockedAtFase: 6,
      description: 'Segurança da foz amazônica e frentes minerais. Estude o CPM, os inquéritos policiais militares (IPM) e a justiça marcial.',
      missionsCount: 15,
    },
    {
      id: 'cmne',
      name: 'Comando Militar do Nordeste (Recife - PE)',
      short: 'CMNE',
      category: 'História',
      topic: 'Revolução de 30, Tenentismo e Lutas de Libertação',
      path: CMNE_PATH,
      labelX: 385, labelY: 240, dotX: 392, dotY: 260,
      color: '#8B6508',
      unlockedAtFase: 2,
      description: 'Guardião do sertão e berço da pátria. Domine a história de consolidação do Exército, revoltas republicanas e heróis do Brasil.',
      missionsCount: 8,
    },
    {
      id: 'cmp',
      name: 'Comando Militar do Planalto (Brasília - DF)',
      short: 'CMP',
      category: 'Português',
      topic: 'Ortografia, Crase, Sintaxe e Regência Oficial',
      path: CMP_PATH,
      labelX: 295, labelY: 285, dotX: 293, dotY: 300,
      color: '#4B5320',
      unlockedAtFase: 1,
      description: 'Coração administrativo das Forças. Domine a Língua Portuguesa padrão de despachos oficiais, circulares e sindicâncias de quartel.',
      missionsCount: 6,
    },
    {
      id: 'cmo',
      name: 'Comando Militar do Oeste (Campo Grande - MS)',
      short: 'CMO',
      category: 'Administração',
      topic: 'Processo Sindicante (Lei 9.784), Inventários e RAE',
      path: CMO_PATH,
      labelX: 218, labelY: 330, dotX: 222, dotY: 348,
      color: '#153118',
      unlockedAtFase: 4,
      description: 'Pantanal e conexões estratégicas centro-oeste. Atue gerenciando processos administrativos e investigando dilemas de RAE.',
      missionsCount: 10,
    },
    {
      id: 'cml',
      name: 'Comando Militar do Leste (Rio de Janeiro - RJ)',
      short: 'CML',
      category: 'Legislação',
      topic: 'Contratos Administrativos e Lei de Licitações (14.133)',
      path: CML_PATH,
      labelX: 340, labelY: 358, dotX: 348, dotY: 375,
      color: '#71644A',
      unlockedAtFase: 5,
      description: 'Berço histórico do QG do Exército. Domine os processos licitatórios, contratos administrativos federais, e dispensas legais.',
      missionsCount: 12,
    },
    {
      id: 'cmse',
      name: 'Comando Militar do Sudeste (São Paulo - SP)',
      short: 'CMSE',
      category: 'Administração',
      topic: 'Estatuto dos Militares, Regulamento Interno (RISG) e RDE',
      path: CMSE_PATH,
      labelX: 298, labelY: 418, dotX: 305, dotY: 428,
      color: '#556B2F',
      unlockedAtFase: 3,
      description: 'Planejamento tático e coordenação operacional de alta escala. Memorize o Regulamento Disciplinar (RDE) e o RISG militar.',
      missionsCount: 10,
    },
    {
      id: 'cms',
      name: 'Comando Militar do Sul (Porto Alegre - RS)',
      short: 'CMS',
      category: 'Geografia',
      topic: 'Geopolítica Sulista, Clima Subtropical e Fronteiras Meridionais',
      path: CMS_PATH,
      labelX: 255, labelY: 488, dotX: 258, dotY: 505,
      color: '#2E5030',
      unlockedAtFase: 2,
      description: 'Força blindada do sul. Exercite conhecimentos do clima subtropical, pecuária, bacias latitudinais e a geopolítica do Mercosul.',
      missionsCount: 6,
    },
  ];

  const faseToPostLabel = (fase: number): string => ({
    2: 'Cabo/3º Sgt', 3: '2º Sgt', 4: '1º Sgt', 5: 'Subtenente', 6: 'Tenente',
  }[fase] ?? `Fase ${fase}`);

  const handleRegionClick = (region: CommandRegion) => {
    audioEngine.playSFX('click');
    if (currentFase < region.unlockedAtFase) {
      audioEngine.playSFX('erro');
      alert(`Bloqueado! O Comando ${region.short} exige o Posto de ${faseToPostLabel(region.unlockedAtFase)}. Avance na FVM!`);
      return;
    }
    setSelectedRegion(region);
  };

  const handleLaunch = () => {
    if (selectedRegion) {
      audioEngine.playSFX('fanfarra');
      onLaunchCategory(selectedRegion.category, selectedRegion.name);
    }
  };

  return (
    <div className="space-y-4">
      {/* MAP HEADER */}
      <div className="text-left bg-[#1A2118] border border-[#C5A059]/20 rounded-xl p-4 flex justify-between items-center shadow-md">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#C5A059] font-mono flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#C5A059] animate-pulse" /> Mapa de Operações do Brasil
          </h3>
          <p className="text-[11px] text-[#A39E93]">
            Ordens de marcha setoriais: selecione o Comando Militar do Exército para despachar lições
          </p>
        </div>
        <Globe className="w-5 h-5 text-[#C5A059] animate-spin" style={{ animationDuration: '30s' }} />
      </div>

      {/* MAP + DETAIL PANEL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* SVG MAP — viewBox 500x600, projeção equirretangular real */}
        <div className="bg-[#111712] border-2 border-[#242D22] rounded-xl p-4 flex items-center justify-center relative min-h-[380px] overflow-hidden">
          <div className="absolute top-4 left-4 border border-[#242D22]/40 w-12 h-12 rounded-full flex items-center justify-center bg-black/20" title="Norte de Campanha">
            <svg className="w-9 h-9 text-[#C5A059]" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="0.8" fill="none" className="opacity-40" />
              <polygon points="12,3 15,12 12,10 9,12" fill="currentColor" />
              <polygon points="12,21 15,12 12,14 9,12" fill="currentColor" className="opacity-30" />
              <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="0.5" className="opacity-30" />
              <text x="12" y="9.5" fontFamily="monospace" fontSize="3.5" fontWeight="bold" fill="currentColor" textAnchor="middle">N</text>
            </svg>
          </div>

          <svg
            viewBox="0 0 500 600"
            className="w-full max-w-[300px] h-auto overflow-visible select-none"
          >
            {/* Grid */}
            {[90,180,270,360,450].map(x => (
              <line key={`v${x}`} x1={x} y1="20" x2={x} y2="590"
                stroke="#242D22" strokeWidth="0.4" strokeDasharray="2 6"/>
            ))}
            {[100,200,300,400,500].map(y => (
              <line key={`h${y}`} x1="20" y1={y} x2="490" y2={y}
                stroke="#242D22" strokeWidth="0.4" strokeDasharray="2 6"/>
            ))}

            <text x="478" y="320" fill="#A39E93" fontSize="5.5" opacity="0.25"
              fontFamily="monospace" transform="rotate(90,478,320)">
              OCEANO ATLÂNTICO
            </text>

            {REGIONS.map((region) => {
              const isUnlocked = currentFase >= region.unlockedAtFase;
              const isHovered = hoveredRegion === region.id;
              const isSelected = selectedRegion?.id === region.id;
              return (
                <g
                  key={region.id}
                  onMouseEnter={() => isUnlocked && setHoveredRegion(region.id)}
                  onMouseLeave={() => setHoveredRegion(null)}
                  onClick={() => handleRegionClick(region)}
                  className={isUnlocked ? 'cursor-pointer' : 'cursor-not-allowed'}
                >
                  <path
                    d={region.path}
                    fill={isSelected ? '#C5A059' : isHovered ? '#3B451B' : isUnlocked ? region.color : '#252525'}
                    stroke={isSelected ? '#FFFFFF' : '#111712'}
                    strokeWidth={isSelected ? '1.2' : '0.5'}
                    opacity={isUnlocked ? '0.92' : '0.35'}
                    className="transition-all duration-200"
                  />
                  {/* Capital dot */}
                  <circle
                    cx={region.dotX} cy={region.dotY}
                    r={isSelected ? 3 : 2}
                    fill={isSelected ? '#FFFFFF' : isUnlocked ? '#C5A059' : '#555'}
                    stroke="#0F1410" strokeWidth="0.4"
                  />
                  {/* Label */}
                  <text
                    x={region.labelX} y={region.labelY}
                    fill={isSelected ? '#111712' : isUnlocked ? '#E8E4D9' : '#666'}
                    fontSize={isSelected ? '8' : '6.5'}
                    fontWeight="bold"
                    fontFamily="monospace"
                    textAnchor="middle"
                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.95)' }}
                  >
                    {region.short}
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="absolute bottom-2.5 left-2.5 flex gap-2 items-center text-[8.5px] font-mono text-[#A39E93] bg-black/40 px-2 py-1 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" /> DESBLOQUEADO
            <span className="w-1.5 h-1.5 rounded-full bg-gray-600" /> BLOQUEADO ({currentFase}/6)
          </div>
        </div>

        {/* DETAIL PANEL */}
        <div className="flex flex-col justify-between">
          {selectedRegion ? (
            <div className="bg-[#1A2118] border border-[#C5A059]/40 rounded-xl p-4 text-left flex flex-col justify-between h-full shadow-inner">
              <div>
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-[9px] font-mono bg-[#C5A059] text-[#111712] px-2 py-0.5 rounded font-extrabold uppercase tracking-wide">
                    EB DIRETÓRIO: {selectedRegion.short}
                  </span>
                  <span className="text-xs font-bold text-[#5F7161] flex items-center gap-1 px-1.5 py-0.5 rounded border border-[#C5A059]/20">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#5F7161]" /> PRONTO
                  </span>
                </div>
                <h4 className="text-base font-bold text-[#E8E4D9] mb-1 leading-tight">
                  {selectedRegion.name}
                </h4>
                <div className="text-xs font-mono font-bold text-[#C5A059] mb-3">
                  Matéria Base: <span className="underline">{selectedRegion.category}</span>
                </div>
                <p className="text-xs text-[#A39E93] leading-relaxed mb-4">
                  {selectedRegion.description}
                </p>
                <div className="space-y-2 p-2.5 bg-[#111712] border border-[#242D22] rounded text-xs font-mono text-[#A39E93]">
                  <div className="flex items-center gap-1.5 text-[10px] text-[#C5A059] font-bold uppercase tracking-wide">
                    <BookOpen className="w-3.5 h-3.5" /> Foco do Concurso:
                  </div>
                  <div className="text-[#E8E4D9]">- {selectedRegion.topic}</div>
                  <div className="text-gray-400">- {selectedRegion.missionsCount} lições táticas cadastradas</div>
                </div>
              </div>
              <button
                onClick={handleLaunch}
                className="mt-6 w-full py-2.5 bg-gradient-to-r from-[#4B5320] to-[#C5A059] text-white font-mono font-bold rounded-lg border-2 border-black tracking-widest transition-all hover:brightness-110 active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-2 shadow"
                style={{ boxShadow: '4px 4px 0px #000' }}
              >
                <PlayCircle className="w-4 h-4 animate-pulse" /> MARCHAR PARA MISSÃO DE ESTUDO
              </button>
            </div>
          ) : (
            <div className="bg-[#1A2118]/40 border border-[#242D22] rounded-xl p-8 text-center flex flex-col items-center justify-center h-full">
              <Compass className="w-12 h-12 text-[#C5A059]/35 mb-3 animate-spin" style={{ animationDuration: '40s' }} />
              <span className="text-xs font-bold font-mono text-[#A39E93] uppercase tracking-wider">
                AGUARDANDO ALINHAMENTO GEOGRÁFICO
              </span>
              <p className="text-[11px] text-[#A39E93]/60 max-w-xs mt-2 leading-relaxed">
                Toque em qualquer dos <span className="text-[#C5A059] font-bold">8 Comandos de Área</span> no
                mapa para revisar a ementa de disciplinas do CHQAO e despachar seu soldado.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
