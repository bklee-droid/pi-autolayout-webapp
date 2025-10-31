const generateBtn = document.getElementById("generateBtn");
const preview = document.getElementById("preview");
const downloadBtn = document.getElementById("downloadBtn");

// ✅ 톤별 스타일 정의
function toneStyle(tone) {
  const map = {
    luxury: { bg: "#ede9fe", text: "#1e1b4b", button: "#5b21b6", font: "Pretendard" },
    emotional: { bg: "#fce7f3", text: "#831843", button: "#db2777", font: "Nanum Myeongjo" },
    modern: { bg: "#f3f4f6", text: "#111827", button: "#111827", font: "Inter" },
    friendly: { bg: "#ffedd5", text: "#7c2d12", button: "#ea580c", font: "Noto Sans KR" },
    trust: { bg: "#dbeafe", text: "#1e3a8a", button: "#2563eb", font: "Inter" }
  };
  return map[tone] || map["modern"];
}

// ✅ 톤별 CTA 문구
function toneCTA(tone) {
  const map = {
    luxury: "지금 구매하기",
    emotional: "따뜻한 순간을 만나보세요",
    modern: "더 알아보기",
    friendly: "함께 시작해요",
    trust: "지금 바로 확인하기"
  };
  return map[tone] || "자세히 보기";
}

// ✅ Midjourney 프롬프트 변환기 (DALL·E에서도 활용)
function makeMidjourneyPrompt(tone, stage, desc) {
  const toneStyle = {
    luxury: "ultra realistic, cinematic lighting, glossy texture, premium brand aesthetic",
    emotional: "soft pastel light, emotional mood, shallow depth of field, lifestyle photo",
    modern: "minimalistic, geometric composition, clean layout, studio lighting",
    friendly: "bright daylight, cozy feeling, smiling people, lifestyle imagery",
    trust: "corporate lighting, neutral background, professional studio, clean shadows"
  };
  return `${toneStyle[tone] || ""}, ${stage}, ${desc}, 4k resolution, detailed, natural color`;
}

// ✅ 실제 이미지 생성 (/api/image 호출)
async function generateImage(prompt, container) {
  container.innerHTML = `
    <div class="animate-pulse w-72 h-72 bg-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-500 italic">
      <p>🖼️ AI 이미지 생성 중...</p>
      <p class="text-xs mt-2">${prompt.slice(0, 60)}...</p>
    </div>
  `;
  try {
    const res = await fetch("/api/image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imagePrompt: prompt })
    });
    const data = await res.json();
    if (data.image_url) {
      container.innerHTML = `<img src="${data.image_url}" class="rounded-xl shadow-lg mt-3 border border-gray-200"/>`;
    } else {
      container.innerHTML = `<p class='text-red-500 text-center'>이미지 생성 실패</p>`;
    }
  } catch (err) {
    console.error("🔥 이미지 생성 오류:", err);
    container.innerHTML = `<p class='text-red-500 text-center'>서버 연결 오류</p>`;
  }
}

// ✅ 메인 레이아웃 생성 로직
generateBtn.addEventListener("click", async () => {
  const brand = document.getElementById("brandName").value.trim();
  const tone = document.getElementById("tone").value;
  const desc = document.getElementById("productDesc").value.trim();

  preview.innerHTML = "<p class='text-gray-500 text-center'>AI가 시각형 스토리 레이아웃을 구성 중입니다...</p>";

  const prompt = `
${brand} 브랜드의 ${tone} 톤으로 아래 상품 설명을 기반으로
'스토리형 + 이미지·설명 교차형 상세페이지'를 구성해줘.

[상품 설명]
${desc}

구조:
1. 문제 제기 (Pain Point)
2. 해결 제시 (Solution)
3. 강점 강조 (Benefit)
4. 사회적 증거 (Review)
5. 행동 유도 (CTA)

각 섹션은 아래 JSON 구조로 출력해:
{
  "sections": [
    {
      "stage": "문제 제기",
      "title": "",
      "subtitle": "",
      "description": "",
      "cta": "",
      "tone": "",
      "layoutType": "text-left-image-right" 또는 "image-left-text-right",
      "imagePrompt": "Midjourney 스타일의 이미지 설명"
    }
  ]
}
설명 문장 없이 JSON만 반환해.
`;

  try {
    const res = await fetch("/api/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });

    const data = await res.json();
    const text = data.content || data.message?.content || "";
    console.log("✅ AI 응답 원본:", text);

    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("AI 응답에서 JSON을 찾을 수 없습니다.");

    const parsed = JSON.parse(match[0]);
    if (!parsed.sections || !Array.isArray(parsed.sections)) {
      throw new Error("sections 배열이 없습니다.");
    }

    renderLayout(parsed.sections, tone);
  } catch (err) {
    console.error("AI 응답 파싱 오류:", err);
    preview.innerHTML = `<p class='text-red-500 text-center'>
      AI 응답을 분석할 수 없습니다.<br>${err.message}</p>`;
  }
});

// ✅ 상세페이지 렌더링
function renderLayout(sections, tone) {
  preview.innerHTML = "";
  downloadBtn.classList.remove("hidden");
  const style = toneStyle(tone);

  sections.forEach((s, i) => {
    const isReverse = s.layoutType === "image-left-text-right";
    const flexClass = isReverse ? "md:flex-row" : "md:flex-row-reverse";

    const box = document.createElement("div");
    box.className = `flex flex-col ${flexClass} items-center justify-between mb-12 bg-white rounded-2xl shadow-lg overflow-hidden`;
    box.style.fontFamily = style.font;
    box.style.color = style.text;

    const imgPrompt = makeMidjourneyPrompt(tone, s.stage, s.imagePrompt);

    box.innerHTML = `
      <div class="md:w-1/2 w-full p-6">
        <h2 class="font-bold text-lg mb-2">${i + 1}. ${s.title}</h2>
        <p class="text-sm mb-2">${s.subtitle || ""}</p>
        <p class="text-sm leading-relaxed mb-4">${s.description || ""}</p>
        <button style="background:${style.button};color:white;padding:10px 20px;border-radius:6px;">
          ${s.cta || toneCTA(tone)}
        </button>
      </div>
      <div class="md:w-1/2 w-full flex flex-col justify-center items-center bg-gray-50">
        <div class="w-72 h-72 bg-gray-100 flex items-center justify-center text-gray-400 italic p-4 rounded-lg">
          ${imgPrompt}
        </div>
        <button class="mt-3 bg-green-600 text-white px-3 py-2 rounded text-sm">AI 이미지 보기</button>
      </div>
    `;

    const imgBtn = box.querySelector("button.bg-green-600");
    const imgContainer = box.querySelector("div.bg-gray-100");
    imgBtn.addEventListener("click", () => generateImage(imgPrompt, imgContainer));

    preview.appendChild(box);
  });
}

// ✅ JPG 다운로드
downloadBtn.addEventListener("click", async () => {
  const canvas = await html2canvas(preview);
  const link = document.createElement("a");
  link.download = "layout.jpg";
  link.href = canvas.toDataURL("image/jpeg", 0.9);
  link.click();
});
