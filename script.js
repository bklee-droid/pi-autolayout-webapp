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
        prompt: `브랜드 ${brand}의 ${tone} 톤앤매너를 가진 상세페이지 AI 자동 레이아웃을 JSON 형식으로 만들어줘. 
        각 섹션은 title, subtitle, description, cta를 포함하며 4~6개의 섹션으로 구성해줘.`
      }),
    });

    const data = await res.json();
    const text = data.content || data.message?.content || data.choices?.[0]?.message?.content;

    if (!text) throw new Error("AI 응답에 content 필드가 없습니다.");

    console.log("AI raw response:", text);

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("JSON 구조를 찾을 수 없습니다.");

    const layout = JSON.parse(jsonMatch[0]);
    renderLayout(layout.sections);
  } catch (e) {
    preview.innerHTML = `<div class='text-red-500 text-center mt-4'>AI 응답을 읽을 수 없습니다. 다시 시도해주세요.</div>`;
    console.error("파싱 오류:", e);
  }
});

function renderLayout(sections) {
  preview.innerHTML = "";
  sections.forEach((s, i) => {
    const box = document.createElement("div");
    box.className =
      "bg-white border border-gray-200 rounded-2xl shadow-md p-5 transition hover:shadow-xl";
    box.innerHTML = `
      <h2 class="text-lg font-semibold text-indigo-600 mb-1">${i + 1}. ${s.title}</h2>
      <p class="text-gray-700 mb-2 font-medium">${s.subtitle}</p>
      <p class="text-gray-500 mb-3 text-sm">${s.description}</p>
      <button class="px-4 py-2 bg-indigo-500 text-white text-sm rounded-lg">${s.cta}</button>
    `;
    preview.appendChild(box);
  });
}
