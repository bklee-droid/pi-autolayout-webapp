const generateBtn = document.getElementById("generateBtn");
const preview = document.getElementById("preview");

generateBtn.addEventListener("click", async () => {
  const brand = document.getElementById("brandName").value.trim() || "기본";
  const tone = document.getElementById("tone").value;

  preview.innerHTML = `<div class='text-center text-gray-500 mt-4'>AI가 레이아웃을 구성 중입니다...</div>`;

  try {
    const res = await fetch("/api/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: `${brand} 브랜드의 ${tone} 톤앤매너를 가진 상세페이지 레이아웃을 만들어줘. 각 섹션은 title, subtitle, description, cta, tone 필드를 포함해야 해.`,
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
    console.error("파싱 오류:", e);
  }
});

function renderLayout(sections, brand) {
  preview.innerHTML = "";

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

    const box = document.createElement("div");
    box.className =
      "rounded-2xl shadow-md p-6 mb-5 transition hover:shadow-xl";
    box.style.backgroundColor = style.bg;
    box.style.fontFamily = style.font;
    box.style.color = style.text;

    box.innerHTML = `
      <h2 style="font-weight:${style.weight};font-size:1.1rem;margin-bottom:6px">${i + 1}. ${s.title}</h2>
      <p style="font-size:0.9rem;margin-bottom:4px">${s.subtitle}</p>
      <p style="font-size:0.85rem;line-height:1.5;margin-bottom:10px">${s.descriptio
