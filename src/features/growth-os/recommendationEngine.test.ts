import assert from "node:assert/strict";
import test from "node:test";
import { matchCourseSkills, matchOpportunity, rankOpportunities } from "./recommendationEngine";

const roadmap = {
  goal: "Become a product manager",
  milestones: [
    { title: "Communication", skills: ["Communication", "Research"], completed: true },
    { title: "Product strategy", skills: ["Product Strategy", "Analytics"], completed: false },
  ],
};

test("opportunity match distinguishes roadmap skills from assessed milestone skills", () => {
  const result = matchOpportunity(
    { id: "role-1", title: "Junior product role", skills: ["communication", "analytics", "sales"] },
    roadmap
  );
  assert.equal(result.score, 47);
  assert.deepEqual(result.pathwayOverlap, ["communication", "analytics"]);
  assert.deepEqual(result.assessedSkills, ["communication"]);
  assert.deepEqual(result.missingSkills, ["sales"]);
});

test("opportunity match does not invent a score without a roadmap", () => {
  const result = matchOpportunity({ id: "role-2", title: "Role", skills: ["Research"] }, null);
  assert.equal(result.score, 0);
  assert.match(result.explanation, /ճանապարհային քարտեզ/);
});

test("opportunity ranking orders the strongest skills alignment first", () => {
  const ranked = rankOpportunities([
    { id: "low", title: "Sales role", skills: ["Sales"] },
    { id: "high", title: "Research role", skills: ["Research"] },
  ], roadmap);
  assert.equal(ranked[0].item.id, "high");
});

test("course match reports only skills present in the learner roadmap", () => {
  const result = matchCourseSkills(["Research", "Graphic design"], roadmap);
  assert.equal(result.score, 50);
  assert.deepEqual(result.relevantSkills, ["Research"]);
});
