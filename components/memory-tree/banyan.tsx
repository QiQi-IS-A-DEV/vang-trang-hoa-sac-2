"use client";

import { useId } from "react";

interface BanyanProps {
  moving?: boolean;
}

export function Banyan({ moving = true }: BanyanProps) {
  const id = useId().replaceAll(":", "");

  return (
    <svg
      viewBox="0 0 800 560"
      className={`banyan-vector pointer-events-none absolute inset-0 h-full w-full select-none ${
        moving ? "wind-active" : ""
      }`}
      role="img"
      aria-label="Cây Đa Mùa Trăng Vầng Trăng Hòa Sắc - Thân cổ thụ uy nghi, tán lá đa tầng sum suê rộng mở để treo nhiều lồng đèn và ngôi sao"
    >
      <defs>
        {/* Vầng trăng rằm huyền ảo & Hào quang tỏa sáng */}
        <radialGradient id={`${id}-moon-glow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff8e7" stopOpacity="0.9" />
          <stop offset="35%" stopColor="#fef08a" stopOpacity="0.55" />
          <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
        </radialGradient>

        <radialGradient id={`${id}-moon-body`} cx="42%" cy="38%" r="60%">
          <stop offset="0%" stopColor="#fffef5" />
          <stop offset="45%" stopColor="#feea9f" />
          <stop offset="80%" stopColor="#f7c858" />
          <stop offset="100%" stopColor="#e5a133" />
        </radialGradient>

        {/* Thân cây gỗ cổ thụ trầm ấm, uy nghi (Shaded bark gradient) */}
        <linearGradient id={`${id}-trunk-wood`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#250d2b" />
          <stop offset="18%" stopColor="#441a3e" />
          <stop offset="42%" stopColor="#6d2b52" />
          <stop offset="68%" stopColor="#8d3f5e" />
          <stop offset="88%" stopColor="#b76967" />
          <stop offset="100%" stopColor="#3b1433" />
        </linearGradient>

        {/* Cành nhánh vươn sang trái */}
        <linearGradient id={`${id}-branch-left`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#351433" />
          <stop offset="35%" stopColor="#5c2447" />
          <stop offset="75%" stopColor="#8e435f" />
          <stop offset="100%" stopColor="#c57c6b" />
        </linearGradient>

        {/* Cành nhánh vươn sang phải */}
        <linearGradient id={`${id}-branch-right`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7a3455" />
          <stop offset="50%" stopColor="#4a1c3f" />
          <stop offset="100%" stopColor="#280e2b" />
        </linearGradient>

        {/* Ánh trăng dát vàng viền cành (Moon rim-lighting) */}
        <linearGradient id={`${id}-rim-gold`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fff3c4" stopOpacity="0.95" />
          <stop offset="45%" stopColor="#fbbf24" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#b45309" stopOpacity="0" />
        </linearGradient>

        {/* Tán lá tầng sâu (Deep Forest Jade) */}
        <radialGradient id={`${id}-canopy-deep`} cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#1a4d41" />
          <stop offset="55%" stopColor="#10362f" />
          <stop offset="100%" stopColor="#08201c" />
        </radialGradient>

        {/* Tán lá tầng giữa sum suê (Lush Jade Green) */}
        <radialGradient id={`${id}-canopy-mid`} cx="45%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#2b775b" />
          <stop offset="50%" stopColor="#1c5541" />
          <stop offset="85%" stopColor="#113a2d" />
          <stop offset="100%" stopColor="#0b261e" />
        </radialGradient>

        {/* Tán lá tầng trên đón trăng (Moonlit Emerald & Gold) */}
        <radialGradient id={`${id}-canopy-light`} cx="48%" cy="20%" r="60%">
          <stop offset="0%" stopColor="#7cb668" />
          <stop offset="40%" stopColor="#3c8454" />
          <stop offset="80%" stopColor="#215940" />
          <stop offset="100%" stopColor="#12382b" />
        </radialGradient>

        {/* Viền sáng vàng kim đỉnh vòm lá */}
        <linearGradient id={`${id}-crest-gold`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" stopOpacity="0.95" />
          <stop offset="40%" stopColor="#facc15" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
        </linearGradient>

        {/* Rễ phụ banyan mềm mại */}
        <linearGradient id={`${id}-root-vine`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#b06766" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#6f2c52" stopOpacity="0.75" />
          <stop offset="85%" stopColor="#451a3d" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#fbcfe8" stopOpacity="0.15" />
        </linearGradient>

        {/* Mô đất phát sáng chân cây */}
        <radialGradient id={`${id}-ground-glow`} cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#58217c" stopOpacity="0.8" />
          <stop offset="40%" stopColor="#3d1547" stopOpacity="0.9" />
          <stop offset="80%" stopColor="#240c2f" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#170820" stopOpacity="0" />
        </radialGradient>

        {/* Biểu tượng lá nhỏ lấp lánh */}
        <g id={`${id}-leaf-cluster`}>
          <ellipse cx="0" cy="0" rx="9" ry="4.5" transform="rotate(-25)" />
          <ellipse cx="8" cy="-3" rx="7.5" ry="4" transform="rotate(20)" />
          <ellipse cx="-7" cy="-4" rx="7" ry="3.5" transform="rotate(-50)" />
        </g>
      </defs>

      {/* ======================================================== */}
      {/* 1. VẦNG TRĂNG RẰM CỔ TÍCH PHÍA SAU CÂY                   */}
      {/* ======================================================== */}
      <g className="moon-layer">
        {/* Hào quang tỏa sáng rộng */}
        <circle cx="410" cy="155" r="220" fill={`url(#${id}-moon-glow)`} opacity="0.65" />
        <circle cx="410" cy="155" r="145" fill={`url(#${id}-moon-glow)`} opacity="0.85" />

        {/* Thân vầng trăng rằm tròn đầy */}
        <circle
          cx="410"
          cy="155"
          r="84"
          fill={`url(#${id}-moon-body)`}
          filter="drop-shadow(0 0 28px rgba(254, 234, 159, 0.8))"
        />

        {/* Họa tiết bóng thỏ ngọc mờ ảo dưới ánh trăng */}
        <path
          d="M375 140 C390 128 418 135 435 145 C420 160 398 168 378 158 Z"
          fill="#eab308"
          opacity="0.22"
        />
        <path
          d="M400 165 C425 155 448 170 458 185 C438 195 412 185 400 165 Z"
          fill="#d97706"
          opacity="0.18"
        />
        <circle cx="440" cy="135" r="16" fill="#fef08a" opacity="0.3" />
      </g>

      {/* ======================================================== */}
      {/* 2. MÔ ĐẤT & BỆ GỐC CÂY CỔ THỤ (GROUND BASE)              */}
      {/* ======================================================== */}
      <g className="ground-layer">
        <ellipse cx="400" cy="530" rx="300" ry="26" fill="#120518" opacity="0.85" />
        <path
          d="M70 545 C200 498 600 498 730 545 C650 558 150 558 70 545 Z"
          fill={`url(#${id}-ground-glow)`}
        />
        <ellipse cx="400" cy="522" rx="200" ry="14" fill="#19483c" opacity="0.45" />
        <ellipse cx="380" cy="520" rx="120" ry="9" fill="#d97706" opacity="0.25" />
      </g>

      {/* ======================================================== */}
      {/* 3. TÁN LÁ HẬU CẢNH RÂM MÁT (DEEP SILHOUETTE FOLIAGE)     */}
      {/* Mở rộng biên độ sang hai bên để bao trọn không gian treo */}
      {/* ======================================================== */}
      <g className="canopy-backdrop" fill={`url(#${id}-canopy-deep)`}>
        {/* Tán vòm nền bồng bềnh xòe rộng */}
        <path d="
          M 90 290
          C 60 230 110 160 170 155
          C 200 100 280 95 330 130
          C 370 70 450 70 490 120
          C 540 85 620 100 645 155
          C 705 160 745 225 715 285
          C 735 345 680 395 615 385
          C 560 415 470 390 435 370
          C 380 400 285 390 240 360
          C 170 395 105 355 90 290
          Z
        " />
      </g>

      {/* ======================================================== */}
      {/* 4. HỆ THỐNG THÂN CÂY VÀ CÁC CHẠC CÀNH UỐN LƯỢN UY NGHI   */}
      {/* Thiết kế liền khối, bề thế, vươn rộng để treo lồng đèn    */}
      {/* ======================================================== */}
      <g className="trunk-and-boughs">
        {/* KHỐI THÂN CỔ THỤ CHÍNH VÀ CÁC BÁNG CÀNH VƯƠN XA */}
        <path
          d="
            M 290 530
            C 305 485 320 450 335 415
            C 315 375 275 340 230 325
            C 185 310 135 295 105 270
            C 130 260 175 270 215 285
            C 255 300 290 322 318 348
            C 330 310 335 260 325 210
            C 318 170 300 135 285 110
            C 310 120 335 145 350 185
            C 365 225 368 270 365 315
            C 380 270 405 220 430 175
            C 445 145 450 115 452 90
            C 470 115 465 155 450 195
            C 435 245 415 290 405 338
            C 430 315 470 285 515 265
            C 570 242 630 240 665 230
            C 638 252 585 268 540 288
            C 492 310 458 340 440 375
            C 455 412 470 455 485 490
            C 495 515 505 526 515 530
            C 485 530 460 515 442 498
            C 425 482 412 445 402 410
            C 392 445 378 482 362 505
            C 345 522 318 530 290 530
            Z
          "
          fill={`url(#${id}-trunk-wood)`}
        />

        {/* Nhánh vươn cao bên trái vút vào tán lá */}
        <path
          d="
            M 230 325
            C 212 275 175 238 140 210
            C 160 212 195 238 218 275
            C 232 298 240 315 245 330
            Z
          "
          fill={`url(#${id}-branch-left)`}
        />

        {/* Nhánh vươn cao bên phải vút vào tán lá */}
        <path
          d="
            M 515 265
            C 548 225 588 190 625 165
            C 608 188 578 225 550 260
            Z
          "
          fill={`url(#${id}-branch-right)`}
        />

        {/* Cành trung tâm vươn cao đón trăng */}
        <path
          d="
            M 368 270
            C 380 220 392 168 398 120
            C 408 160 400 212 388 260
            Z
          "
          fill={`url(#${id}-rim-gold)`}
          opacity="0.85"
        />

        {/* Vân vỏ cây cổ thụ 3D uyển chuyển (Wood Grain Contours) */}
        <g fill="none" strokeLinecap="round" opacity="0.65">
          <path
            d="M325 520 C342 475 358 435 368 385 C378 340 378 288 368 235"
            stroke="#9f5468"
            strokeWidth="3.5"
          />
          <path
            d="M358 520 C375 470 390 428 400 375 C408 335 405 285 422 235"
            stroke="#e2a87a"
            strokeWidth="2.5"
          />
          <path
            d="M445 515 C432 468 420 425 426 382 C438 332 480 300 528 280"
            stroke="#5c2042"
            strokeWidth="4"
          />
          <path
            d="M305 522 C318 468 338 425 318 380 C295 338 245 318 195 295"
            stroke="#cca078"
            strokeWidth="2.2"
          />

          {/* Vệt sáng viền trăng trên báng cành */}
          <path
            d="M140 210 C175 238 215 275 230 325"
            stroke="#ffe494"
            strokeWidth="2.5"
            opacity="0.85"
          />
          <path
            d="M452 90 C462 140 445 198 420 255"
            stroke="#fef08a"
            strokeWidth="3"
            opacity="0.9"
          />
          <path
            d="M515 265 C565 242 618 238 660 230"
            stroke="#fde047"
            strokeWidth="2.5"
            opacity="0.8"
          />
        </g>

        {/* Chân rễ cây cổ thụ nở rộng bám chặt mô đất */}
        <path
          d="
            M 270 530
            C 292 505 315 475 328 442
            C 335 475 322 510 305 530
            Z
          "
          fill="#341330"
        />
        <path
          d="
            M 495 500
            C 512 512 532 524 548 530
            C 525 530 510 522 495 512
            Z
          "
          fill="#341330"
        />
      </g>

      {/* ======================================================== */}
      {/* 5. DÀN RỄ PHỤ BANYAN BUÔNG LƠI MỀM MẠI (AERIAL ROOTS)    */}
      {/* ======================================================== */}
      <g className="banyan-aerial-roots" fill="none" strokeLinecap="round">
        <path
          className="banyan-root-sway"
          d="M 215 295 C 210 360 228 420 235 485 C 238 505 235 518 232 526"
          stroke={`url(#${id}-root-vine)`}
          strokeWidth="3.2"
        />
        <path
          className="banyan-root-sway"
          style={{ animationDelay: "-1.5s" }}
          d="M 252 332 C 248 388 260 445 265 495 C 267 512 265 522 262 527"
          stroke="#9f5468"
          strokeWidth="2"
          opacity="0.8"
        />
        <path
          className="banyan-root-sway"
          style={{ animationDelay: "-0.8s" }}
          d="M 565 285 C 555 350 538 415 528 475 C 525 502 528 518 530 526"
          stroke={`url(#${id}-root-vine)`}
          strokeWidth="3.5"
        />
        <path
          className="banyan-root-sway"
          style={{ animationDelay: "-2.3s" }}
          d="M 505 320 C 498 375 488 430 482 480 C 480 502 482 518 485 527"
          stroke="#9f5468"
          strokeWidth="2.2"
          opacity="0.85"
        />

        {/* Dây leo mảnh mai đung đưa */}
        {[
          { x: 165, y: 285, len: 120, delay: "-0.5s" },
          { x: 195, y: 305, len: 150, delay: "-1.8s" },
          { x: 275, y: 340, len: 110, delay: "-2.6s" },
          { x: 460, y: 345, len: 130, delay: "-1.2s" },
          { x: 545, y: 305, len: 160, delay: "-3.4s" },
          { x: 635, y: 250, len: 100, delay: "-0.9s" },
        ].map((vine, i) => (
          <path
            key={i}
            className="banyan-root-sway"
            style={{ animationDelay: vine.delay }}
            d={`M ${vine.x} ${vine.y} Q ${vine.x - 6} ${vine.y + vine.len * 0.6} ${vine.x + 2} ${vine.y + vine.len}`}
            stroke="#fbcfe8"
            strokeWidth="1.2"
            opacity="0.45"
          />
        ))}
      </g>

      {/* ======================================================== */}
      {/* 6. HỆ THỐNG VÒM TÁN LÁ BỒNG BỀNH ĐA TẦNG (CANOPY CLOUDS)  */}
      {/* Uốn lượn mềm mại quanh cành, để hở khoảng trống treo đèn  */}
      {/* ======================================================== */}
      <g className="canopy-terraces">
        {/* == TÁN TRÁI TRÊN & GIỮA == */}
        <g className="banyan-crown" style={{ transformOrigin: "210px 220px", animationDelay: "-1s" }}>
          <path
            d="
              M 90 270
              C 70 225 100 170 145 155
              C 180 135 235 145 260 175
              C 290 158 335 175 345 210
              C 355 250 325 290 285 305
              C 240 322 185 310 150 295
              C 120 305 100 290 90 270
              Z
            "
            fill={`url(#${id}-canopy-mid)`}
          />
          <path
            d="
              M 115 240
              C 105 200 135 165 175 160
              C 205 155 240 175 255 198
              C 278 188 310 198 320 225
              C 330 255 300 285 270 290
              C 230 298 195 288 172 275
              C 140 280 122 265 115 240
              Z
            "
            fill={`url(#${id}-canopy-light)`}
            opacity="0.9"
          />
          {/* Viền vàng trăng rằm đỉnh tán trái */}
          <path
            d="M 145 160 C 180 140 235 150 260 178 C 290 162 328 178 338 205"
            fill="none"
            stroke={`url(#${id}-crest-gold)`}
            strokeWidth="4.5"
            opacity="0.85"
          />
        </g>

        {/* == TÁN ĐỈNH NGỌN TRUNG TÂM (ĐÓN TRĂNG RẰM) == */}
        <g className="banyan-crown" style={{ transformOrigin: "410px 150px", animationDelay: "-2.4s" }}>
          <path
            d="
              M 270 165
              C 260 115 305 70 365 65
              C 415 60 468 80 490 112
              C 530 92 578 112 590 155
              C 600 198 568 235 520 245
              C 468 255 412 245 375 228
              C 330 245 285 212 270 165
              Z
            "
            fill={`url(#${id}-canopy-mid)`}
          />
          <path
            d="
              M 305 140
              C 300 102 338 75 385 75
              C 430 75 472 95 488 122
              C 520 110 552 128 558 160
              C 562 192 535 220 498 225
              C 450 230 405 218 378 202
              C 340 215 312 182 305 140
              Z
            "
            fill={`url(#${id}-canopy-light)`}
            opacity="0.92"
          />
          {/* Ánh kim vàng rực rỡ đỉnh ngọn */}
          <path
            d="M 315 88 C 365 65 425 70 460 92 C 498 82 540 102 558 135"
            fill="none"
            stroke="#fef08a"
            strokeWidth="5"
            filter="drop-shadow(0 0 10px rgba(254, 240, 138, 0.9))"
            opacity="0.92"
          />
        </g>

        {/* == TÁN PHẢI TRÊN & GIỮA == */}
        <g className="banyan-crown" style={{ transformOrigin: "590px 220px", animationDelay: "-3.8s" }}>
          <path
            d="
              M 455 215
              C 450 168 498 125 552 130
              C 595 135 638 162 655 195
              C 698 185 742 215 738 265
              C 732 312 690 340 642 340
              C 592 340 555 322 528 305
              C 485 315 455 268 455 215
              Z
            "
            fill={`url(#${id}-canopy-mid)`}
          />
          <path
            d="
              M 488 198
              C 485 158 530 138 572 148
              C 610 158 642 185 655 212
              C 688 205 715 232 710 270
              C 705 305 668 322 630 320
              C 588 318 555 302 532 285
              C 492 292 482 248 488 198
              Z
            "
            fill={`url(#${id}-canopy-light)`}
            opacity="0.9"
          />
          {/* Ánh kim đỉnh tán phải */}
          <path
            d="M 510 135 C 558 130 605 152 632 180 C 665 180 708 202 720 235"
            fill="none"
            stroke={`url(#${id}-crest-gold)`}
            strokeWidth="4.5"
            opacity="0.85"
          />
        </g>

        {/* == TÁN VÒM TRÁI DƯỚI (MỞ RỘNG BIÊN ĐỘ ĐỂ TREO ĐÈN) == */}
        <g className="banyan-crown" style={{ transformOrigin: "180px 330px", animationDelay: "-1.5s" }}>
          <path
            d="
              M 110 330
              C 95 290 128 250 170 245
              C 205 240 245 258 260 288
              C 275 320 250 355 210 365
              C 170 375 125 360 110 330
              Z
            "
            fill={`url(#${id}-canopy-mid)`}
          />
          <path
            d="
              M 130 315
              C 120 285 145 255 180 252
              C 210 250 240 268 250 292
              C 260 320 238 348 205 352
              C 170 358 138 340 130 315
              Z
            "
            fill={`url(#${id}-canopy-light)`}
            opacity="0.85"
          />
        </g>

        {/* == TÁN VÒM PHẢI DƯỚI (MỞ RỘNG BIÊN ĐỘ ĐỂ TREO ĐÈN) == */}
        <g className="banyan-crown" style={{ transformOrigin: "620px 330px", animationDelay: "-3.2s" }}>
          <path
            d="
              M 540 288
              C 555 258 595 240 630 245
              C 672 250 705 290 690 330
              C 675 360 630 375 590 365
              C 550 355 525 320 540 288
              Z
            "
            fill={`url(#${id}-canopy-mid)`}
          />
          <path
            d="
              M 550 292
              C 560 268 590 250 620 252
              C 655 255 680 285 670 315
              C 662 340 630 358 595 352
              C 562 348 540 320 550 292
              Z
            "
            fill={`url(#${id}-canopy-light)`}
            opacity="0.85"
          />
        </g>

        {/* == TÁN TẦNG GIỮA DƯỚI KẾT NỐI HÀI HÒA == */}
        <g className="banyan-crown" style={{ transformOrigin: "400px 310px", animationDelay: "-2.1s" }}>
          <path
            d="
              M 265 310
              C 250 260 300 225 355 230
              C 405 215 470 220 495 255
              C 530 260 545 300 528 338
              C 505 375 450 385 405 380
              C 350 380 300 370 278 348
              C 260 335 265 320 265 310
              Z
            "
            fill={`url(#${id}-canopy-light)`}
            opacity="0.88"
          />
          <ellipse cx="400" cy="290" rx="115" ry="48" fill="#256b4f" opacity="0.55" />
        </g>
      </g>

      {/* ======================================================== */}
      {/* 7. HOA TIẾT LÁ VÀNG LẤP LÁNH & ĐOM ĐÓM BAY LƯỢN         */}
      {/* ======================================================== */}
      <g className="leaf-accents">
        {/* Điểm xuyết cụm lá vàng kim dọc theo viền tán */}
        {[
          { x: 155, y: 155, rot: -20, scale: 1 },
          { x: 235, y: 145, rot: 15, scale: 0.9 },
          { x: 330, y: 75, rot: -10, scale: 1.1 },
          { x: 410, y: 65, rot: 5, scale: 1.2 },
          { x: 495, y: 85, rot: 25, scale: 1.1 },
          { x: 580, y: 135, rot: 30, scale: 1 },
          { x: 670, y: 195, rot: 45, scale: 0.9 },
          { x: 710, y: 255, rot: 60, scale: 0.8 },
          { x: 115, y: 255, rot: -45, scale: 0.85 },
          { x: 275, y: 205, rot: 10, scale: 0.9 },
          { x: 535, y: 225, rot: -15, scale: 0.95 },
          { x: 195, y: 355, rot: -15, scale: 0.9 },
          { x: 615, y: 355, rot: 15, scale: 0.9 },
        ].map((leaf, idx) => (
          <use
            key={idx}
            href={`#${id}-leaf-cluster`}
            x={leaf.x}
            y={leaf.y}
            transform={`rotate(${leaf.rot} ${leaf.x} ${leaf.y}) scale(${leaf.scale})`}
            fill="#fef08a"
            opacity="0.85"
            filter="drop-shadow(0 0 4px rgba(254, 240, 138, 0.6))"
          />
        ))}

        {/* Đom đóm đêm hội bay chầm chậm quanh tán cây */}
        {[
          { cx: 190, cy: 320, r: 2.2, delay: "0s" },
          { cx: 290, cy: 240, r: 2.8, delay: "1.2s" },
          { cx: 370, cy: 170, r: 3.2, delay: "0.5s" },
          { cx: 470, cy: 200, r: 2.6, delay: "2.1s" },
          { cx: 570, cy: 290, r: 2.4, delay: "1.7s" },
          { cx: 640, cy: 340, r: 2, delay: "3s" },
          { cx: 250, cy: 430, r: 2.5, delay: "0.8s" },
          { cx: 530, cy: 420, r: 2.7, delay: "2.5s" },
        ].map((firefly, idx) => (
          <circle
            key={idx}
            className={moving ? "tree-firefly" : ""}
            cx={firefly.cx}
            cy={firefly.cy}
            r={firefly.r}
            fill="#fff3c4"
            style={{ animationDelay: firefly.delay }}
            filter="drop-shadow(0 0 6px #facc15)"
          />
        ))}
      </g>
    </svg>
  );
}
