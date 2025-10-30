const generateBtn = document.getElementById("generateBtn");
const preview = document.getElementById("preview");
const downloadBtn = document.getElementById("downloadBtn");

// 톤 매핑
const toneMapKor = {
  luxury: "프리미엄",
  trust: "신뢰",
  modern: "모던",
  friendly: "친근",
  emotional: "감성",
};

// tone별 문체 규칙
const toneStyleRules = {
  프리미엄: "품격 있고 간결한 문체, 전문 용어 사용, 군더더기 없는 설명.",
  감성: "감정적으로 공감시키는 문체, 부드럽고 따뜻한 표현.",
  모던: "간결하고 트렌디한 문체, 영어 키워드 일부 포함 가능.",
  친근: "대화체 문체, 쉽고 유머러스하게.",
  신뢰: "데이터 기반, 객관적 어조, 근거 중심.",
};

// 5단계 스토리 구조
const storyStages = [
  { key: "problem", name: "문제 제기 (Pain Point)", imgHint: "사용자의 불편, 고민, 일상 속 문제를 상징하는 이미지" },
  { key: "solution", name: "해결 제시 (Solution)", imgHint: "제품 또는 브랜드가 문제를 해결하는 모습을 보여주는 이미지" },
  { key: "benefit", name: "강점 강조 (Benefit)", imgHint: "제품의 주요 특징과 장점을 강조하는 클로즈업 이미지" },
  { key: "proof", name: "사회적 증거 (Review)", imgHint: "리뷰, 별점, 인증, 고객 만족을 나타내는 이미지" },
  { key: "cta", name: "행동 유도 (Call to Action)", imgHint: "명확한 구매 유도나 참여 요청을 시각화한 이미지" },
];

// CTA 문구 tone별
const toneCTA = {
  프리미엄: ["지금 구매하기", "럭셔리 컬렉션 보기"],
  감성: ["감성 스토리 더보기", "우리의 감성을 느껴보세요"],
  모던: ["자세히 알아보기", "모던 라인 탐색하기"],
  친근: ["바로 만나보기", "함께해요"],
  신뢰: ["제품 보러가기", "자세히 확인하기"],
};

// ---------------------- AI 생성 -------------------------
generateBtn.addEventListener("click", async () => {
  const brand = document.getElementById("brandName").value.trim() || "기본 브랜드";
  const toneValue = document.getElementById("tone").value;
  const toneKor = toneMapKor[toneValue] || "프리미엄";
  const toneStyle = toneStyleRules[toneKor];
  const product = document.getElementById("productDesc").value.trim() || "제품 설명 없음";

  preview.innerHTML = `<div class='text-center text-gray-500 mt-4'>AI가 상세페이지 스토리를 구성 중입니다...</div>`;

  const stageList = storyStages.map((s, i) => `${i + 1}. ${s.name}`).join("\n");

  try {
    const res = await fetch("/api/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: `
        ${brand} 브랜드의 ${toneKor} 톤앤매너(${toneStyle})로 아래 상품 설명을 중심으로
        상세페이지 스토리를 만들어줘.

        [상품 설명]
        ${product}

        스토리는 다음 5단계를 반드시 포함해야 한다:
        ${stageList}

        각 섹션은 title, subtitle, description, cta, tone, stage, imagePrompt 필드를 포함해야 한다.
        각 섹션의 imagePrompt에는 '${toneKor}' 톤에 어울리는 ${brand}의 분위기를 담은 ${stageList}용 이미지 설명을 써줘.
        JSON 형식으로만 응답해.
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

// ---------------------- 렌더 -------------------------
function renderLayout(sections, brand) {
  preview.innerHTML = "";
  downloadBtn.classList.remove("hidden");

  sections.forEach((s, i) => {
    const tone = s.tone || "프리미엄";
    const base = toneMapBase[tone] || toneMapBase["프리미엄"];
    const ctaSet = toneCTA[tone] || ["지금 확인하기"];
    const ctaText = s.cta || ctaSet[Math.floor(Math.random() * ctaSet.length)];

    const box = document.createElement("div");
    box.className = "rounded-2xl shadow-md p-6 mb-5 transition hover:shadow-xl";
    box.style.backgroundColor = base.bg;
    box.style.fontFamily = base.font;
    box.style.color = base.text;

    // 단계별 이미지 제안 문구
    const imgHint = s.imagePrompt || storyStages[i]?.imgHint || "브랜드 감성 이미지";

    box.innerHTML = `
      <h2 contenteditable="true" class="editable font-bold" style="font-size:1.2rem;margin-bottom:6px">${s.title}</h2>
      <p contenteditable="true" style="font-size:0.95rem;margin-bottom:4px">${s.subtitle}</p>
      <p contenteditable="true" style="font-size:0.85rem;line-height:1.5;margin-bottom:10px">${s.description}</p>
      <button contenteditable="true" style="background:${base.button};color:white;border:none;padding:8px 14px;border-radius:8px;cursor:text;font-size:0.9rem">${ctaText}</button>
      <div class="mt-3 text-xs text-gray-600 italic">🖼️ 이미지 제안: ${imgHint}</div>
    `;

    // 수정 하이라이트
    box.querySelectorAll("[contenteditable]").forEach(el => {
      el.addEventListener("focus", () => {
        el.dataset.originalBg = el.style.backgroundColor || "transparent";
        el.style.backgroundColor = "rgba(255,255,0,0.2)";
      });
      el.addEventListener("blur", () => {
        el.style.backgroundColor = el.dataset.originalBg;
      });
    });

    preview.appendChild(box);
  });
}

// ---------------------- 톤 기본 스타일 -------------------------
const toneMapBase = {
  프리미엄: { bg: "#ede9fe", text: "#1e1b4b", button: "#5b21b6", font: "Pretendard" },
  감성: { bg: "#fce7f3", text: "#831843", button: "#db2777", font: "Nanum Myeongjo" },
  모던: { bg: "#e5e7eb", text: "#111827", button: "#1f2937", font: "Inter" },
  친근: { bg: "#ffedd5", text: "#7c2d12", button: "#ea580c", font: "Noto Sans KR" },
  신뢰: { bg: "#dbeafe", text: "#1e3a8a", button: "#2563eb", font: "Inter" },
};
