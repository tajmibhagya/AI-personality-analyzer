"use client";

import { Document, Page, Text, View, StyleSheet, Svg, Polygon, Line, Circle, Image } from "@react-pdf/renderer";
import type { Personality, LifeReflection } from "@/lib/api";

type RecommendationItem = {
  title: string;
  author_director?: string;
  year?: number;
  description: string;
  why?: string;
  traits?: string[];
};

type StoredRecommendations = {
  books: RecommendationItem[];
  films: RecommendationItem[];
  music: RecommendationItem[];
  activities: RecommendationItem[];
  savedAt: number;
};

type PDFDocumentProps = {
  userName: string;
  personality: Personality | null;
  lastAnalyzedAt: number | null;
  reflection: LifeReflection | null;
  reflectionAt: number | null;
  recommendations: StoredRecommendations | null;
};

const TRAIT_COLORS: Record<string, string> = {
  Openness: "#0ea5a4",
  Conscientiousness: "#3b82f6",
  Extraversion: "#a78bfa",
  Agreeableness: "#f59e0b",
  Neuroticism: "#f43f5e",
};

const TRAIT_BG: Record<string, string> = {
  Openness: "#e6fafa",
  Conscientiousness: "#eff6ff",
  Extraversion: "#f5f3ff",
  Agreeableness: "#fffbeb",
  Neuroticism: "#fff1f2",
};

const TRAIT_DESCS: Record<string, string> = {
  Openness: "Curiosity, imagination, and openness to new experiences.",
  Conscientiousness: "Organization, discipline, and goal-directed behavior.",
  Extraversion: "Energy drawn from social interaction and the outside world.",
  Agreeableness: "Warmth, cooperation, and trust toward others.",
  Neuroticism: "Sensitivity to stress and negative emotional states.",
};

const TRAIT_IMAGES: Record<string, string> = {
  Openness: "/traits/openness.jpeg",
  Conscientiousness: "/traits/conscientiousness.jpeg",
  Extraversion: "/traits/extraversion.jpeg",
  Agreeableness: "/traits/agreeableness.jpeg",
  Neuroticism: "/traits/neuroticism.jpeg",
};

const MEDIUM_COLORS: Record<string, string> = {
  books: "#3b82f6",
  films: "#a78bfa",
  music: "#f59e0b",
  activities: "#0ea5a4",
};

const MEDIUM_BG: Record<string, string> = {
  books: "#eff6ff",
  films: "#f5f3ff",
  music: "#fffbeb",
  activities: "#e6fafa",
};

const MEDIUM_ICONS: Record<string, string> = {
  books: "📚",
  films: "🎬",
  music: "🎵",
  activities: "⚡",
};

function sigmoid(x: number) { return 1 / (1 + Math.exp(-x)); }
function normalize(p: Personality): Record<string, number> {
  return Object.fromEntries(Object.entries(p).map(([k, v]) => [k, sigmoid(v)]));
}
function levelLabel(score: number) {
  if (score >= 0.75) return "HIGH";
  if (score >= 0.60) return "MOD-HIGH";
  if (score >= 0.45) return "AVERAGE";
  if (score >= 0.25) return "MOD-LOW";
  return "LOW";
}
function formatDate(ts: number | null): string {
  if (!ts) return "";
  return new Date(ts).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

const s = StyleSheet.create({
  page: { padding: 44, fontFamily: "Helvetica", backgroundColor: "#ffffff", color: "#111827" },
  coverBg: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#0b1220" },
  coverWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
  coverBrand: { fontSize: 11, color: "#0ea5a4", fontFamily: "Helvetica-Bold", letterSpacing: 4, marginBottom: 24 },
  coverTitle: { fontSize: 40, fontFamily: "Helvetica-Bold", color: "#ffffff", marginBottom: 10 },
  coverSub: { fontSize: 14, color: "#6b7280", marginBottom: 48 },
  coverName: { fontSize: 24, fontFamily: "Helvetica-Bold", color: "#0ea5a4", marginBottom: 8 },
  coverDate: { fontSize: 11, color: "#4b5563" },
  coverAccent: { position: "absolute", bottom: 0, left: 0, right: 0, height: 4, backgroundColor: "#0ea5a4" },
  hdr: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#e5e7eb", paddingBottom: 8, marginBottom: 20 },
  hdrBrand: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#0ea5a4", letterSpacing: 2 },
  hdrPage: { fontSize: 9, color: "#9ca3af" },
  sectionTitle: { fontSize: 24, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  sectionSub: { fontSize: 11, color: "#6b7280", marginBottom: 20 },
  traitRow: { flexDirection: "row", alignItems: "stretch", marginBottom: 10, borderRadius: 8, overflow: "hidden", minHeight: 72 },
  traitLeft: { flex: 1, padding: 10, justifyContent: "center" },
  traitName: { fontSize: 13, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  traitDesc: { fontSize: 9, color: "#6b7280", lineHeight: 1.4, marginBottom: 6 },
  traitBarTrack: { height: 6, backgroundColor: "#e5e7eb", borderRadius: 3, marginBottom: 3 },
  traitBarFill: { height: 6, borderRadius: 3 },
  traitScore: { fontSize: 9, fontFamily: "Helvetica-Bold" },
  traitImg: { width: 72, height: 72 },
  traitBadge: { fontSize: 7, fontFamily: "Helvetica-Bold", letterSpacing: 1, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4, marginBottom: 4, alignSelf: "flex-start" },
  radarWrap: { alignItems: "center", marginBottom: 6 },
  radarLabel: { fontSize: 8, color: "#6b7280", marginTop: 4, textAlign: "center" },
  reflSection: { marginBottom: 16 },
  reflHeading: { fontSize: 12, fontFamily: "Helvetica-Bold", marginBottom: 8, paddingLeft: 8, borderLeftWidth: 3 },
  reflBody: { fontSize: 11, lineHeight: 1.65, color: "#374151" },
  bullet: { flexDirection: "row", marginBottom: 6 },
  bulletNum: { fontSize: 11, fontFamily: "Helvetica-Bold", width: 18 },
  bulletTxt: { fontSize: 11, lineHeight: 1.55, color: "#374151", flex: 1 },
  question: { fontSize: 11, lineHeight: 1.6, color: "#374151", fontStyle: "italic", paddingLeft: 10, borderLeftWidth: 2, borderLeftColor: "#a78bfa", marginBottom: 8 },
  caveat: { marginTop: 20, padding: 10, backgroundColor: "#fffbeb", borderRadius: 6 },
  caveatLabel: { fontSize: 7, fontFamily: "Helvetica-Bold", color: "#92400e", letterSpacing: 1, marginBottom: 3 },
  caveatTxt: { fontSize: 9, color: "#78350f", lineHeight: 1.5 },
  emptyBox: { padding: 20, backgroundColor: "#f9fafb", borderRadius: 6, alignItems: "center" },
  emptyTxt: { fontSize: 11, color: "#9ca3af", textAlign: "center" },
  footer: { position: "absolute", bottom: 20, left: 44, right: 44, flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#e5e7eb", paddingTop: 8 },
  footerTxt: { fontSize: 8, color: "#9ca3af" },
  mediumSection: { marginBottom: 16 },
  mediumHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8, paddingBottom: 4, borderBottomWidth: 1 },
  mediumTitle: { fontSize: 14, fontFamily: "Helvetica-Bold" },
  recCard: { borderRadius: 8, padding: 10, marginBottom: 6 },
  recTitle: { fontSize: 12, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  recMeta: { fontSize: 9, color: "#6b7280", marginBottom: 4 },
  recDesc: { fontSize: 10, color: "#374151", lineHeight: 1.5 },
  recWhy: { fontSize: 9, color: "#0ea5a4", marginTop: 4, fontStyle: "italic" },
  recTraits: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 4 },
  recTrait: { fontSize: 7, fontFamily: "Helvetica-Bold", paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4, backgroundColor: "#e5e7eb", color: "#374151" },
});

function PDFRadar({ norm }: { norm: Record<string, number> }) {
  const traits = ["Openness", "Conscientiousness", "Extraversion", "Agreeableness", "Neuroticism"];
  const size = 240;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = 88;
  const angles = traits.map((_, i) => -Math.PI / 2 + (i * 2 * Math.PI) / 5);
  const rings = [0.25, 0.5, 0.75, 1].map((f) =>
    angles.map((a) => `${(cx + Math.cos(a) * f * maxR).toFixed(1)},${(cy + Math.sin(a) * f * maxR).toFixed(1)}`).join(" ")
  );
  const polyPoints = angles.map((a, i) => {
    const r = (norm[traits[i]] || 0) * maxR;
    return `${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`;
  }).join(" ");
  const dotPositions = angles.map((a, i) => ({
    x: cx + Math.cos(a) * (norm[traits[i]] || 0) * maxR,
    y: cy + Math.sin(a) * (norm[traits[i]] || 0) * maxR,
    color: TRAIT_COLORS[traits[i]],
  }));
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {rings.map((pts, i) => <Polygon key={i} points={pts} fill="none" stroke="#e5e7eb" strokeWidth={0.6} />)}
      {angles.map((a, i) => (
        <Line key={i} x1={cx} y1={cy} x2={(cx + Math.cos(a) * maxR).toFixed(1)} y2={(cy + Math.sin(a) * maxR).toFixed(1)} stroke="#e5e7eb" strokeWidth={0.5} />
      ))}
      <Polygon points={polyPoints} fill="#0ea5a4" fillOpacity={0.25} stroke="#0ea5a4" strokeWidth={1.8} />
      {dotPositions.map((d, i) => <Circle key={i} cx={d.x} cy={d.y} r={3} fill={d.color} />)}
    </Svg>
  );
}

function RadarWithLabels({ norm }: { norm: Record<string, number> }) {
  const traits = ["Openness", "Conscientiousness", "Extraversion", "Agreeableness", "Neuroticism"];
  const size = 240;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = 88;
  const angles = traits.map((_, i) => -Math.PI / 2 + (i * 2 * Math.PI) / 5);
  return (
    <View style={{ width: size, position: "relative", height: size, marginBottom: 4 }}>
      <PDFRadar norm={norm} />
      {angles.map((a, i) => {
        const lx = cx + Math.cos(a) * (maxR + 22);
        const ly = cy + Math.sin(a) * (maxR + 22);
        return (
          <Text key={i} style={{ position: "absolute", left: lx - 28, top: ly - 6, width: 56, fontSize: 7, fontFamily: "Helvetica-Bold", color: TRAIT_COLORS[traits[i]], textAlign: "center" }}>
            {traits[i]}
          </Text>
        );
      })}
    </View>
  );
}

function MediumSection({ medium, items }: { medium: string; items: RecommendationItem[] }) {
  const color = MEDIUM_COLORS[medium];
  const bg = MEDIUM_BG[medium];
  const icon = MEDIUM_ICONS[medium];
  const label = medium.charAt(0).toUpperCase() + medium.slice(1);
  if (!items || items.length === 0) return null;
  return (
    <View style={s.mediumSection}>
      <View style={[s.mediumHeader, { borderBottomColor: color }]}>
        <Text style={[s.mediumTitle, { color }]}>{icon}  {label}</Text>
      </View>
      {items.slice(0, 3).map((item, i) => (
        <View key={i} style={[s.recCard, { backgroundColor: bg }]}>
          <Text style={[s.recTitle, { color }]}>{item.title}</Text>
          {(item.author_director || item.year) ? (
            <Text style={s.recMeta}>
              {[item.author_director, item.year ? String(item.year) : null].filter(Boolean).join(" · ")}
            </Text>
          ) : null}
          <Text style={s.recDesc}>{item.description}</Text>
          {item.why ? <Text style={s.recWhy}>{item.why}</Text> : null}
          {item.traits && item.traits.length > 0 ? (
            <View style={s.recTraits}>
              {item.traits.slice(0, 3).map((t, j) => (
                <Text key={j} style={s.recTrait}>{t}</Text>
              ))}
            </View>
          ) : null}
        </View>
      ))}
    </View>
  );
}

export function PDFDocument({ userName, personality, lastAnalyzedAt, reflection, reflectionAt, recommendations }: PDFDocumentProps) {
  const norm = personality ? normalize(personality) : null;
  const traits = ["Openness", "Conscientiousness", "Extraversion", "Agreeableness", "Neuroticism"];
  const hasAnyRecs = recommendations && (
    recommendations.books.length > 0 ||
    recommendations.films.length > 0 ||
    recommendations.music.length > 0 ||
    recommendations.activities.length > 0
  );

  return (
    <Document>
      {/* PAGE 1 — COVER */}
      <Page size="A4" style={s.page}>
        <View style={s.coverBg} />
        <View style={s.coverWrap}>
          <Text style={s.coverBrand}>MINDPROFILE AI</Text>
          <Text style={s.coverTitle}>Personality{"\n"}Report</Text>
          <Text style={s.coverSub}>Big Five analysis from your writing</Text>
          <Text style={s.coverName}>For {userName}</Text>
          <Text style={s.coverDate}>Generated {formatDate(Date.now())}</Text>
        </View>
        <View style={s.coverAccent} />
        <View style={s.footer}>
          <Text style={[s.footerTxt, { color: "#4b5563" }]}>MindProfile AI</Text>
          <Text style={[s.footerTxt, { color: "#4b5563" }]}>Page 1</Text>
        </View>
      </Page>

      {/* PAGE 2 — BIG FIVE */}
      <Page size="A4" style={s.page}>
        <View style={s.hdr}>
          <Text style={s.hdrBrand}>MINDPROFILE AI</Text>
          <Text style={s.hdrPage}>Big Five Profile</Text>
        </View>
        <Text style={s.sectionTitle}>Your Big Five</Text>
        <Text style={s.sectionSub}>{norm ? `Analyzed ${formatDate(lastAnalyzedAt)}` : "Not yet analyzed"}</Text>
        {norm ? (
          <>
            <View style={s.radarWrap}>
              <RadarWithLabels norm={norm} />
              <Text style={s.radarLabel}>The further from center, the higher the trait</Text>
            </View>
            <View style={{ marginTop: 12 }}>
              {traits.map((trait) => {
                const score = norm[trait] || 0;
                const pct = Math.round(score * 100);
                const color = TRAIT_COLORS[trait];
                const bg = TRAIT_BG[trait];
                const level = levelLabel(score);
                return (
                  <View key={trait} style={[s.traitRow, { backgroundColor: bg }]}>
                    <View style={s.traitLeft}>
                      <Text style={[s.traitBadge, { backgroundColor: color + "28", color }]}>{level}</Text>
                      <Text style={[s.traitName, { color }]}>{trait}</Text>
                      <Text style={s.traitDesc}>{TRAIT_DESCS[trait]}</Text>
                      <View style={s.traitBarTrack}>
                        <View style={[s.traitBarFill, { width: `${pct}%`, backgroundColor: color }]} />
                      </View>
                      <Text style={[s.traitScore, { color }]}>{pct}%</Text>
                    </View>
                    <Image src={TRAIT_IMAGES[trait]} style={s.traitImg} />
                  </View>
                );
              })}
            </View>
          </>
        ) : (
          <View style={s.emptyBox}>
            <Text style={s.emptyTxt}>No personality data yet.{"\n"}Go to the Analyzer and paste your writing.</Text>
          </View>
        )}
        <View style={s.footer}>
          <Text style={s.footerTxt}>MindProfile AI</Text>
          <Text style={s.footerTxt}>Page 2</Text>
        </View>
      </Page>

      {/* PAGE 3 — REFLECTION */}
      <Page size="A4" style={s.page}>
        <View style={s.hdr}>
          <Text style={s.hdrBrand}>MINDPROFILE AI</Text>
          <Text style={s.hdrPage}>Apply to my life</Text>
        </View>
        <Text style={s.sectionTitle}>Reflection</Text>
        <Text style={s.sectionSub}>{reflection ? `Generated ${formatDate(reflectionAt)}` : "No reflection yet"}</Text>
        {reflection ? (
          <>
            {reflection.summary ? (
              <View style={s.reflSection}>
                <Text style={[s.reflHeading, { borderLeftColor: "#0ea5a4", color: "#0ea5a4" }]}>In one paragraph</Text>
                <Text style={s.reflBody}>{reflection.summary}</Text>
              </View>
            ) : null}
            {reflection.takeaways_for_you && reflection.takeaways_for_you.length > 0 ? (
              <View style={s.reflSection}>
                <Text style={[s.reflHeading, { borderLeftColor: "#22c55e", color: "#16a34a" }]}>Takeaways for you</Text>
                {reflection.takeaways_for_you.map((t, i) => (
                  <View key={i} style={s.bullet}>
                    <Text style={[s.bulletNum, { color: "#0ea5a4" }]}>{i + 1}.</Text>
                    <Text style={s.bulletTxt}>{t}</Text>
                  </View>
                ))}
              </View>
            ) : null}
            {reflection.where_this_might_be_hard && reflection.where_this_might_be_hard.length > 0 ? (
              <View style={s.reflSection}>
                <Text style={[s.reflHeading, { borderLeftColor: "#f59e0b", color: "#d97706" }]}>Where this might be hard</Text>
                {reflection.where_this_might_be_hard.map((w, i) => (
                  <View key={i} style={s.bullet}>
                    <Text style={[s.bulletNum, { color: "#f59e0b" }]}>!</Text>
                    <Text style={s.bulletTxt}>{w}</Text>
                  </View>
                ))}
              </View>
            ) : null}
            {reflection.reflection_questions && reflection.reflection_questions.length > 0 ? (
              <View style={s.reflSection}>
                <Text style={[s.reflHeading, { borderLeftColor: "#a78bfa", color: "#7c3aed" }]}>Reflection questions</Text>
                {reflection.reflection_questions.map((q, i) => (
                  <Text key={i} style={s.question}>{q}</Text>
                ))}
              </View>
            ) : null}
            {reflection.caveat ? (
              <View style={s.caveat}>
                <Text style={s.caveatLabel}>NOTE</Text>
                <Text style={s.caveatTxt}>{reflection.caveat}</Text>
              </View>
            ) : null}
          </>
        ) : (
          <View style={s.emptyBox}>
            <Text style={s.emptyTxt}>No reflection yet.{"\n"}Go to Upload CV and apply an article to your life.</Text>
          </View>
        )}
        <View style={s.footer}>
          <Text style={s.footerTxt}>MindProfile AI</Text>
          <Text style={s.footerTxt}>Page 3</Text>
        </View>
      </Page>

      {/* PAGE 4 — RECOMMENDATIONS */}
      <Page size="A4" style={s.page}>
        <View style={s.hdr}>
          <Text style={s.hdrBrand}>MINDPROFILE AI</Text>
          <Text style={s.hdrPage}>Your Recommendations</Text>
        </View>
        <Text style={s.sectionTitle}>Picked for you</Text>
        <Text style={s.sectionSub}>
          {hasAnyRecs ? `Books, films, music, and activities matched to your Big Five profile.` : "No recommendations saved yet."}
        </Text>
        {hasAnyRecs ? (
          <>
            <MediumSection medium="books" items={recommendations!.books} />
            <MediumSection medium="films" items={recommendations!.films} />
            <MediumSection medium="music" items={recommendations!.music} />
            <MediumSection medium="activities" items={recommendations!.activities} />
          </>
        ) : (
          <View style={s.emptyBox}>
            <Text style={s.emptyTxt}>Visit the Recommendations page first.{"\n"}Browse books, films, music, and activities.{"\n"}They will appear here automatically.</Text>
          </View>
        )}
        <View style={s.footer}>
          <Text style={s.footerTxt}>MindProfile AI</Text>
          <Text style={s.footerTxt}>Page 4</Text>
        </View>
      </Page>
    </Document>
  );
}
