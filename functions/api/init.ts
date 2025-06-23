import {generateAICharacters } from '../../src/config/aiCharacters';
import { groups } from '../../src/config/groups';
export async function onRequestGet(context) {
    try {
      return Response.json({
        code: 200,
        data: {
          groups: groups,
          characters: generateAICharacters('#groupName#', '#allTags#'),
          user: context.data.user || null
        }
      });
    } catch (error) {
      console.error(error);
      return Response.json(
        { error: error.message },
        { status: 500 }
      );
    }
  }