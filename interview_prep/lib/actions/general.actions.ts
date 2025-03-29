"use server";

import { feedbackSchema } from "@/constants";
import { db } from "@/firebase/admin";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";

export async function getInterviewByUserId(
  userId: string
): Promise<Interview[] | null> {
  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();
  if (interviews.empty) {
    return null;
  }
  return interviews.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) as Interview[];
}

export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;
  const interviews = await db
    .collection("interviews")
    .where("finalized", "==", true)
    .where("userId", "!=", userId)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();
  if (interviews.empty) {
    return null;
  }
  return interviews.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) as Interview[];
}

export async function getInterviewById(id: string): Promise<Interview | null> {
  const Interview = await db.collection("interviews").doc(id).get();
  if (!Interview.exists) {
    return null;
  }
  return { ...Interview.data(), id: Interview.id } as Interview;
}

export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript } = params;
  try {
    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `-${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    const {
      object: {
        totalScore,
        categoryScores,
        strengths,
        areasForImprovement,
        finalAssessment,
      },
    } = await generateObject({
      model: google("gemini-2.0-flash-001", {
        structuredOutputs: false,
      }),
      schema: feedbackSchema,
      prompt: `
        You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
        Transcript:
        ${formattedTranscript}

        Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
        - **Communication Skills**: Clarity, articulation, structured responses.
        - **Technical Knowledge**: Understanding of key concepts for the role.
        - **Problem-Solving**: Ability to analyze problems and propose solutions.
        - **Cultural & Role Fit**: Alignment with company values and job role.
        - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
        `,
      system:
        "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
    });

    const feedback = await db.collection("feedback").add({
      interviewId,
      userId,
      totalScore,
      categoryScores,
      strengths,
      areasForImprovement,
      finalAssessment,
      createdAt: new Date().toISOString(),
    });

    return { success: true, feedbackId: feedback.id };
  } catch (error) {
    console.log("Error in create feedback ", error);
    return { success: false, message: "Something went wrong" };
  }
}

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;
  const feedback = await db
    .collection("feedback")
    .where("userId", "==", userId)
    .where("interviewId", "==", interviewId)
    .limit(1)
    .get();
  if (feedback.empty) {
    return null;
  }

  const feedbackDoc = feedback.docs[0];
  return {
    ...feedbackDoc.data(),
    id: feedbackDoc.id,
  } as Feedback;
}
