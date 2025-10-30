const generateBtn = document.getElementById("generateBtn");
const preview = document.getElementById("preview");
const downloadBtn = document.getElementById("downloadBtn");

const toneMapKor = {
  luxury: "프리미엄",
  trust: "신뢰",
  modern: "모던",
  friendly: "친근",
  emotional: "감성",
};

const brandToneWeight = {
  더쉬어: { 프리미엄: 0.7, 감성: 0.3 },
  모두들: { 친근: 0.6, 모던: 0.4 },
  멜론차: { 감성: 0.8, 프리미엄: 0.2 },
};

const toneCTA = {
  프리미엄: ["지금 구매하기", "럭셔리 컬렉션 보기"],
  감성: ["감성 스토리 더보기", "우리의 감성을 느껴보세요"],
  모던: ["자세히 알아보기", "모던 라인 탐색하기"],
  친근: ["바로 만나보기", "함께해요"],
  신뢰: ["제품 보러가기", "자세히 확인하기"],
};

const toneFontRatio = {
  프리미엄: { title: 1.25, subtitle: 1.05, cta: 1.0 },
  감성: { title: 1.15, subtitle: 1.0, cta: 0.95 },
  모던: { title: 1.1, subtitle: 1.0, cta: 1.0 },
  친근: { title: 1.1, subtitle: 1.0, cta: 1.05 },
  신뢰: { title: 1.05, subtitle: 0.95, cta: 0.95 },
};

generateBtn.addEventListener("click", async () => {
  const brand = document.getElementById("brandName").value.trim() || "기본 브랜드";
  const toneValue = document.getElementById("tone").value;
  const toneKor = toneMapKor[toneValue] || "프리미엄";
  const product = document.getElementById("productDesc").value.trim() || "제품 설명 없음";

  const toneWeightText = brandToneWeight[brand]
    ? Object.entries(brandToneWeight[brand])
        .map(([tone, weight]) => `${tone} ${Math.round(weight * 100)}%`)
        .join(", ")
    : `${toneKor} 100%`;

  preview.innerHTML = `<div class='text-center text-gray-500 mt-4'>AI가 레이아웃을 구성 중입니다...</div>`;

  try {
    const res = await fetch("/api/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: `
        ${brand} 브랜드의 ${toneKor} 톤앤매너를 기반으로 
        아래 상품 설명을 참고하여 상세페이지 레이아웃을 만들어줘.

        [상품 설명]
        ${product}

        이 브랜드의 tone 비율은 다음과 같아:
        ${toneWeightText}

        각 섹션은 title, subtitle, description, tone, cta를 포함한 JSON 형식으로 응답하고,
        tone에 따라 CTA 문장을 자연스럽게 변형해줘.
        (예: 프리미엄 → 지금 구매하기, 감성 → 감성 스토리 더보기 등)
        `,
      }),
    });

    const data = await res.json();
    const text = data.content || data.message?.content;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("JSON 응답이 비정상입니다.");

    const layout = JSON.parse(jsonMatch[0]);
    renderLayout(layout.sections, brand);
  } catch (e) {
    preview.innerHTML = `<div class='text-red-500 text-center mt-4'>AI 응답을 읽을 수 없습니다. 다시 시도해주세요.</div>`;
    console.error("🔥 파싱 오류:", e);
  }
});

function renderLayout(sections, brand) {
  preview.innerHTML = "";
  downloadBtn.classList.remove("hidden"); // 다운로드 버튼 표시

  const toneMapBase = {
    프리미엄: { bg: "#ede9fe", text: "#1e1b4b", button: "#5b21b6", font: "Pretendard", weight: 600 },
    감성: { bg: "#fce7f3", text: "#831843", button: "#db2777", font: "Nanum Myeongjo", weight: 500 },
    모던: { bg: "#e5e7eb", text: "#111827", button: "#1f2937", font: "Inter", weight: 600 },
    친근: { bg: "#ffedd5", text: "#7c2d12", button: "#ea580c", font: "Noto Sans KR", weight: 500 },
    신뢰: { bg: "#dbeafe", text: "#1e3a8a", button: "#2563eb", font: "Inter", weight: 600 },
  };

  const brandPalettes = {
    모두들: {
      프리미엄: { bg: "#ede9fe", button: "#5b21b6" },
      감성: { bg: "#fff1f2", button: "#e11d48" },
      신뢰: { bg: "#e0f2fe", button: "#0284c7" },
    },
    더쉬어: {
      프리미엄: { bg: "#f5f3ff", button: "#7c3aed" },
      감성: { bg: "#ffe4e6", button: "#f43f5e" },
      모던: { bg: "#f3f4f6", button: "#111827" },
    },
  };

  sections.forEach((s, i) => {
    const tone = s.tone || "프리미엄";
    const base = toneMapBase[tone];
    const custom =
      brandPalettes[brand] && brandPalettes[brand][tone]
        ? brandPalettes[brand][tone]
        : {};
    const style = { ...base, ...custom };

    const ctaSet = toneCTA[tone] || ["지금 확인하기"];
    const ctaText = s.cta || ctaSet[Math.floor(Math.random() * ctaSet.length)];
    const ratio = toneFontRatio[tone] || { title: 1, subtitle: 1, cta: 1 };

    const box = document.createElement("div");
    box.className = "rounded-2xl shadow-md p-6 mb-5 transition hover:shadow-xl";
    box.style.backgroundColor = style.bg;
    box.style.fontFamily = style.font;
    box.style.color = style.text;

    // ✅ 수정 가능한 텍스트(contenteditable)
    box.innerHTML = `
      <h2 contenteditable="true" style="font-weight:${style.weight};
          font-size:${1.1 * ratio.title}rem;margin-bottom:6px;outline:none;">
          ${i + 1}. ${s.title}
      </h2>

      <p contenteditable="true" style="font-size:${0.9 * ratio.subtitle}rem;
          margin-bottom:4px;outline:none;">
          ${s.subtitle}
      </p>

      <p contenteditable="true" style="font-size:0.85rem;line-height:1.5;
          margin-bottom:10px;outline:none;">
          ${s.description}
      </p>

      <button contenteditable="true" style="background:${style.button};
          color:white;border:none;padding:${8 * ratio.cta}px ${14 * ratio.cta}px;
          border-radius:8px;cursor:pointer;font-size:${0.85 * ratio.cta}rem;outline:none;">
          ${ctaText}
      </button>
    `;

    // 미묘한 hover 효과
    box.addEventListener("mouseenter", () => (box.style.transform = "scale(1.03)"));
    box.addEventListener("mouseleave", () => (box.style.transform = "scale(1)"));

    // ✅ 사용자가 수정한 내용 console에 자동 반영
    box.querySelectorAll("[contenteditable]").forEach(el => {
      el.addEventListener("input", () => {
        console.log(`✏️ 수정됨: ${el.innerText}`);
      });
    });

    preview.appendChild(box);
  });
}

// 결과 JPG 다운로드 기능
downloadBtn.addEventListener("click", async () => {
  const target = document.getElementById("preview");
  downloadBtn.textContent = "이미지 생성 중...";
  downloadBtn.disabled = true;

  try {
    const canvas = await html2canvas(target, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
    });
    const link = document.createElement("a");
    link.download = `PI_AutoLayout_${new Date().toISOString().split("T")[0]}.jpg`;
    link.href = canvas.toDataURL("image/jpeg", 0.95);
    link.click();
  } catch (error) {
    console.error("이미지 저장 오류:", error);
    alert("이미지를 생성하는 중 오류가 발생했습니다.");
  } finally {
    downloadBtn.textContent = "결과 JPG 다운로드";
    downloadBtn.disabled = false;
  }
});
