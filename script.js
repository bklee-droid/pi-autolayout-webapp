const generateBtn = document.getElementById("generateBtn");
const preview = document.getElementById("preview");

generateBtn.addEventListener("click", async () => {
  const brand = document.getElementById("brandName").value.trim();
  const tone = document.getElementById("tone").value;

  if (!brand) {
    alert("브랜드 이름을 입력해주세요.");
    return;
  }

  preview.innerHTML = `<div class='text-center text-gray-500 mt-4'>AI가 레이아웃을 구성 중입니다...</div>`;

  try {
    const res = await fetch("/api/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: `${brand} 브랜드의 ${tone} 톤앤매너를 가진 상세페이지 레이아웃을 만들어줘.
        각 섹션은 title, subtitle, description, cta, tone(프리미엄/감성/모던/친근/신뢰 중 하나)을 포함해 JSON 형식으로 응답해줘.`,
      }),
    });

    const data = await res.json();
    const text = data.content || data.message?.content;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("JSON 응답이 비정상입니다.");
    const layout = JSON.parse(jsonMatch[0]);
    renderLayout(layout.sections);
  } catch (e) {
    preview.innerHTML = `<div class='text-red-500 text-center mt-4'>AI 응답을 읽을 수 없습니다. 다시 시도해주세요.</div>`;
    console.error("파싱 오류:", e);
  }
});

function renderLayout(sections) {
  preview.innerHTML = "";

  const toneMap = {
    프리미엄: {
      bg: "#f9f7ff",
      text: "#1f1b2d",
      button: "#6a5acd",
      font: "Pretendard, sans-serif",
      weight: 600,
      scale: 1.05,
    },
    감성: {
      bg: "#fffaf7",
      text: "#4b2e05",
      button: "#f59e0b",
      font: "Nanum Myeongjo, serif",
      weight: 400,
      scale: 1.1,
    },
    모던: {
      bg: "#f9fafb",
      text: "#111827",
      button: "#111827",
      font: "Inter, sans-serif",
      weight: 600,
      scale: 1.0,
    },
    친근: {
      bg: "#fefce8",
      text: "#3f3f46",
      button: "#f97316",
      font: "Noto Sans KR, sans-serif",
      weight: 500,
      scale: 1.08,
    },
    신뢰: {
      bg: "#f3f9ff",
      text: "#1a2733",
      button: "#2563eb",
      font: "Inter, sans-serif",
      weight: 500,
      scale: 0.98,
    },
  };

  sections.forEach((s, i) => {
    const style = toneMap[s.tone] || toneMap["프리미엄"];
    const box = document.createElement("div");
    box.className =
      "rounded-2xl shadow-md p-6 mb-5 transition hover:shadow-xl";
    box.style.backgroundColor = style.bg;
    box.style.fontFamily = style.font;
    box.style.color = style.text;
    box.style.transform = `scale(${style.scale})`;
    box.style.transition = "transform 0.3s ease";

    box.innerHTML = `
      <h2 style="font-weight:${style.weight};font-size:1.1rem;margin-bottom:6px;color:${style.text}">
        ${i + 1}. ${s.title}
      </h2>
      <p style="font-size:0.9rem;color:${style.text};margin-bottom:4px">${s.subtitle}</p>
      <p style="font-size:0.85rem;line-height:1.5;margin-bottom:10px;color:${style.text}">${s.description}</p>
      <button style="background:${style.button};color:white;border:none;padding:8px 14px;border-radius:8px;cursor:pointer">
        ${s.cta}
      </button>
    `;
    box.addEventListener("mouseenter", () => (box.style.transform = `scale(${style.scale + 0.03})`));
    box.addEventListener("mouseleave", () => (box.style.transform = `scale(${style.scale})`));
    preview.appendChild(box);
  });
}
