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

// ---------------------- AI 생성 -------------------------
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

// ---------------------- 렌더 + 편집기 기능 -------------------------
function renderLayout(sections, brand) {
  preview.innerHTML = "";
  downloadBtn.classList.remove("hidden");

  const savedData = JSON.parse(localStorage.getItem("piLayoutSave") || "{}");

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

    const id = `${brand}-${i}`;
    const saved = savedData[id] || {};

    const box = document.createElement("div");
    box.className = "rounded-2xl shadow-md p-6 mb-5 transition hover:shadow-xl";
    box.style.backgroundColor = style.bg;
    box.style.fontFamily = style.font;
    box.style.color = style.text;

    // ✅ contenteditable + 하이라이트 + tone 실시간 반응
    box.innerHTML = `
      <h2 contenteditable="true" class="editable" data-field="title" data-tone="${tone}" data-id="${id}"
        style="font-weight:${style.weight};font-size:${1.1 * ratio.title}rem;margin-bottom:6px;outline:none;cursor:text;user-select:text;transition:background-color 0.2s ease;">
        ${saved.title || s.title}
      </h2>

      <p contenteditable="true" class="editable" data-field="subtitle" data-tone="${tone}" data-id="${id}"
        style="font-size:${0.9 * ratio.subtitle}rem;margin-bottom:4px;outline:none;cursor:text;user-select:text;transition:background-color 0.2s ease;">
        ${saved.subtitle || s.subtitle}
      </p>

      <p contenteditable="true" class="editable" data-field="description" data-tone="${tone}" data-id="${id}"
        style="font-size:0.85rem;line-height:1.5;margin-bottom:10px;outline:none;cursor:text;user-select:text;transition:background-color 0.2s ease;">
        ${saved.description || s.description}
      </p>

      <button contenteditable="true" class="editable" data-field="cta" data-tone="${tone}" data-id="${id}"
        style="background:${style.button};color:white;border:none;padding:${8 * ratio.cta}px ${14 * ratio.cta}px;border-radius:8px;cursor:text;user-select:text;font-size:${0.85 * ratio.cta}rem;outline:none;transition:background-color 0.2s ease;">
        ${saved.cta || ctaText}
      </button>
    `;

    // ✅ 하이라이트 효과
    box.querySelectorAll("[contenteditable]").forEach(el => {
      el.addEventListener("focus", () => {
        el.dataset.originalBg = el.style.backgroundColor || "transparent";
        el.style.backgroundColor = "rgba(255,255,0,0.2)";
      });
      el.addEventListener("blur", () => {
        el.style.backgroundColor = el.dataset.originalBg;
      });

      // ✅ 수정 → localStorage 자동 저장
      el.addEventListener("input", () => {
        const id = el.dataset.id;
        const field = el.dataset.field;
        const value = el.innerText.trim();
        const existing = JSON.parse(localStorage.getItem("piLayoutSave") || "{}");
        existing[id] = existing[id] || {};
        existing[id][field] = value;
        localStorage.setItem("piLayoutSave", JSON.stringify(existing));
        console.log(`💾 저장됨: ${id}.${field} = ${value}`);
      });

      // ✅ tone 실시간 변경 반응
      el.addEventListener("keydown", e => {
        if (e.key === "/" && el.innerText.includes("신뢰")) applyToneChange(box, "신뢰");
        if (e.key === "/" && el.innerText.includes("감성")) applyToneChange(box, "감성");
        if (e.key === "/" && el.innerText.includes("모던")) applyToneChange(box, "모던");
        if (e.key === "/" && el.innerText.includes("친근")) applyToneChange(box, "친근");
        if (e.key === "/" && el.innerText.includes("프리미엄")) applyToneChange(box, "프리미엄");
      });
    });

    preview.appendChild(box);
  });

  addExportButton();
}

// ---------------------- Tone 실시간 색상 변환 -------------------------
function applyToneChange(box, tone) {
  const style = toneMapBase[tone];
  if (!style) return;
  box.style.backgroundColor = style.bg;
  box.style.color = style.text;
  box.style.fontFamily = style.font;
  box.querySelector("button").style.backgroundColor = style.button;
  console.log(`🎨 tone 변경: ${tone}`);
}

// ---------------------- JSON Export -------------------------
function addExportButton() {
  if (document.getElementById("exportBtn")) return;
  const exportBtn = document.createElement("button");
  exportBtn.id = "exportBtn";
  exportBtn.textContent = "JSON Export";
  exportBtn.className = "w-full bg-yellow-500 text-white py-3 rounded-lg hover:bg-yellow-600 mt-2";
  document.querySelector(".max-w-2xl").appendChild(exportBtn);

  exportBtn.addEventListener("click", () => {
    const data = localStorage.getItem("piLayoutSave") || "{}";
    const blob = new Blob([data], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `PI_AutoLayout_Edit_${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    console.log("📤 JSON Export 완료");
  });
}

// ---------------------- JPG 저장 -------------------------
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
