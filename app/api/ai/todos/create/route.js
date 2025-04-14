import OpenAI from "openai";
import { NextResponse } from "next/server";
import { createTask, createCustomer } from "@/lib/data-service";
import { supabase } from "@/lib/supabase";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const body = await request.json();
    const userMessage = body.message;

    if (!userMessage) {
      return NextResponse.json(
        { error: "Bericht is vereist" }, // Dutch error
        { status: 400 }
      );
    }

    // Updated Dutch prompt asking for specific fields
    const systemPrompt = `
      Je bent een assistent die taakinformatie uit gebruikersberichten haalt om een takenlijstitem aan te maken voor een Nederlands bedrijf.
      Analyseer het verzoek van de gebruiker en identificeer:
      1. De kerntaakomschrijving.
      2. De naam van het bedrijf dat genoemd wordt (indien aanwezig).
      3. Een specifieke deadline OF een weeknummer (indien aanwezig). Geef slechts een van beide terug.

      Formatteer de uitvoer STRIKT als een JSON-object met de volgende vier sleutels:
      - "taakOmschrijving" (string): De beschrijving van de taak.
      - "bedrijfsnaam" (string | null): De naam van het bedrijf, of null indien niet genoemd.
      - "deadlineString" (string | null): De deadline als tekst (bv. "morgenmiddag", "eind van de week", "volgende week dinsdag"), of null indien niet genoemd of als weeknummer is gegeven.
      - "weeknummer" (integer | null): Het weeknummer als getal (bv. 42), of null indien niet genoemd of als deadlineString is gegeven.

      Voorbeeld gebruikersbericht: "Herinner me eraan om Jansen BV te bellen over de offerte volgende week woensdag"
      Voorbeeld JSON-uitvoer: {"taakOmschrijving": "Jansen BV bellen over de offerte", "bedrijfsnaam": "Jansen BV", "deadlineString": "volgende week woensdag", "weeknummer": null}

      Voorbeeld gebruikersbericht: "planning maken voor Reints week 45"
      Voorbeeld JSON-uitvoer: {"taakOmschrijving": "planning maken voor Reints", "bedrijfsnaam": "Reints", "deadlineString": null, "weeknummer": 45}

      Voorbeeld gebruikersbericht: "nieuwe blogpost schrijven"
      Voorbeeld JSON-uitvoer: {"taakOmschrijving": "nieuwe blogpost schrijven", "bedrijfsnaam": null, "deadlineString": null, "weeknummer": null}
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Or "gpt-4"
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1, // Lower temperature for consistency
    });

    const aiResponse = completion.choices[0].message.content;
    let aiData;

    try {
      aiData = JSON.parse(aiResponse);
      // Basic validation (adjust based on new keys)
      if (
        typeof aiData.taakOmschrijving !== "string" ||
        (aiData.bedrijfsnaam !== null &&
          typeof aiData.bedrijfsnaam !== "string") ||
        (aiData.deadlineString !== null &&
          typeof aiData.deadlineString !== "string") ||
        (aiData.weeknummer !== null && typeof aiData.weeknummer !== "number")
      ) {
        throw new Error("Ongeldige JSON-structuur van AI");
      }
    } catch (parseError) {
      console.error(
        "Error parsing JSON from OpenAI:",
        parseError,
        "Raw response:",
        aiResponse
      );
      return NextResponse.json(
        { error: "Kon AI antwoord niet verwerken", details: aiResponse },
        { status: 500 }
      );
    }

    // --- Find or Create Customer ID ---
    let customerId = null;
    if (aiData.bedrijfsnaam) {
      const companyName = aiData.bedrijfsnaam;
      try {
        // 1. Try to find existing customer by company name (case-insensitive)
        const { data: existingCustomer, error: findError } = await supabase
          .from("customers")
          .select("id, company")
          .ilike("company", companyName) // Case-insensitive search
          .maybeSingle(); // Returns one record or null, doesn't error if not found

        if (findError) {
          console.error(`Error finding customer "${companyName}":`, findError);
          // Decide how to handle this - proceed without customer_id?
          throw findError; // For now, rethrow to stop processing
        }

        if (existingCustomer) {
          // Customer found
          customerId = existingCustomer.id;
          console.log(
            `Found existing customer ID ${customerId} for company "${companyName}"`
          );
        } else {
          // Customer not found, create new one
          console.log(
            `No customer found for "${companyName}", attempting to create.`
          );
          try {
            const newCustomer = await createCustomer(companyName); // Call the new function
            if (newCustomer && newCustomer.id) {
              customerId = newCustomer.id;
              console.log(
                `Successfully created new customer with ID ${customerId} for company "${companyName}"`
              );
            } else {
              console.error(
                `Failed to create customer or get ID for "${companyName}".`
              );
              // Proceed without customer ID or throw error?
            }
          } catch (createError) {
            console.error(
              `Error during customer creation for "${companyName}":`,
              createError
            );
            // Decide how to handle - proceed without customer_id?
            // For now, we'll proceed without customer ID if creation fails
          }
        }
      } catch (customerLookupError) {
        console.error(
          `General error during customer lookup/creation for "${companyName}":`,
          customerLookupError
        );
        // Proceed without customer ID
      }
    }

    // --- Prepare Task Data for Supabase ---
    const taskPayload = {
      title: aiData.taakOmschrijving,
      description: null, // Or perhaps use the original userMessage? `userMessage`
      customer_id: customerId, // Use found ID or null
      priority: "medium", // Default priority
      due_date: aiData.deadlineString, // Pass the string directly
      week_number: aiData.weeknummer, // Pass the number or null
      status: "todo", // Default status
    };

    // --- Create Task in Supabase ---
    try {
      console.log("Attempting to create task with payload:", taskPayload);
      const createdTask = await createTask(taskPayload); // Call your existing function
      console.log("Task created successfully in Supabase:", createdTask);
      return NextResponse.json(createdTask); // Return the full task object
    } catch (dbError) {
      console.error(
        "Error creating task in Supabase via data-service:",
        dbError
      );
      return NextResponse.json(
        {
          error: "Kon taak niet opslaan in database",
          details: dbError.message,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    // Keep existing generic OpenAI API error handling
    console.error("Error calling OpenAI API or processing request:", error);
    if (error.response) {
      console.error(error.response.status, error.response.data);
      return NextResponse.json(
        { error: "Fout van OpenAI API", details: error.response.data },
        { status: error.response.status }
      );
    } else {
      return NextResponse.json(
        { error: "Interne Server Fout" },
        { status: 500 }
      );
    }
  }
}
