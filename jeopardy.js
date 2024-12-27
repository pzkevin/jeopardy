// You only need to touch comments with the todo of this file to complete the assignment!

/*
=== How to build on top of the starter code? ===

Problems have multiple solutions.
We have created a structure to help you on solving this problem.
On top of the structure, we created a flow shaped via the below functions.
We left descriptions, hints, and to-do sections in between.
If you want to use this code, fill in the to-do sections.
However, if you're going to solve this problem yourself in different ways, you can ignore this starter code.
 */

/*
=== Terminology for the API ===

Clue: The name given to the structure that contains the question and the answer together.
Category: The name given to the structure containing clues on the same topic.
 */

/*
=== Data Structure of Request the API Endpoints ===

/categories:
[
  {
    "id": <category ID>,
    "title": <category name>,
    "clues_count": <number of clues in the category where each clue has a question, an answer, and a value>
  },
  ... more categories
]

/category:
{
  "id": <category ID>,
  "title": <category name>,
  "clues_count": <number of clues in the category>,
  "clues": [
    {
      "id": <clue ID>,
      "answer": <answer to the question>,
      "question": <question>,
      "value": <value of the question (be careful not all questions have values) (Hint: you can assign your own value such as 200 or skip)>,
      ... more properties
    },
    ... more clues
  ]
}
 */

const API_URL = "https://rithm-jeopardy.herokuapp.com/api/"; // The URL of the API.
const NUMBER_OF_CATEGORIES = 9; // The number of categories you will be fetching. You can change this number.
const NUMBER_OF_CLUES_PER_CATEGORY = 5; // The number of clues you will be displaying per category. You can change this number.

let categories = []; // The categories with clues fetched from the API.
/*
[
  {
    "id": <category ID>,
    "title": <category name>,
    "clues": [
      {
        "id": <clue ID>,
        "value": <value (e.g. $200)>,
        "question": <question>,
        "answer": <answer>
      },
      ... more categories
    ]
  },
  ... more categories
]
 */

//for styling purposes only
const activeClueElement = document.getElementById('active-clue');

let activeClue = null; // Currently selected clue data.
let activeClueMode = 0; // Controls the flow of #active-clue element while selecting a clue, displaying the question of selected clue, and displaying the answer to the question.
/*
0: Empty. Waiting to be filled. If a clue is clicked, it shows the question (transits to 1).
1: Showing a question. If the question is clicked, it shows the answer (transits to 2).
2: Showing an answer. If the answer is clicked, it empties (transits back to 0).
 */

let isPlayButtonClickable = true; // Only clickable when the game haven't started yet or ended. Prevents the button to be clicked during the game.

$("#play").on("click", handleClickOfPlay);

/**
 * Manages the behavior of the play button (start or restart) when clicked.
 * Sets up the game.
 *
 * Hints:
 * - Sets up the game when the play button is clickable.
 */
function handleClickOfPlay() {
  // todo set the game up if the play button is clickable
  if (isPlayButtonClickable) {
    setupTheGame()
  }
}

/**
 * Sets up the game.
 *
 * 1. Cleans the game since the user can be restarting the game.
 * 2. Get category IDs
 * 3. For each category ID, get the category with clues.
 * 4. Fill the HTML table with the game data.
 *
 * Hints:
 * - The game play is managed via events.
 */
async function setupTheGame() {
  // todo show the spinner while setting up the game
  $("#spinner").removeClass("disabled");

  categories = [];
  activeClue = null;
  activeClueMode = 0;
  isPlayButtonClickable = false;

  // todo reset the DOM (table, button text, the end text)
  $("#categories tr").empty();
  $("#clues tr").empty();
  $("#active-clue").empty();

  // todo fetch the game data (categories with clues)
  let categoriesRes = await axios.get(`https://rithm-jeopardy.herokuapp.com/api/categories?count=${NUMBER_OF_CATEGORIES}`);//fetches the categories

  // /categories returns only the category id, title, and clues_count while /category returns the clues as well as the category id, title, and clues_count

  // Fetch data for each category and store in categories array
  for (let category of categoriesRes.data) {
    let cluesRes = await axios.get(`https://rithm-jeopardy.herokuapp.com/api/category?id=${category.id}`);//fetches the clues for each category
    categories.push({
      id: category.id,
      title: category.title,
      clues: cluesRes.data.clues //clues for each category
    })
    console.log(category)
  }

  // todo fill the table
  fillTable(categories);
  $("#spinner").addClass("disabled");
}

/**
 * Fills the HTML table using category data.
 *
 * Hints:
 * - You need to call this function using an array of categories where each element comes from the `getCategoryData` function.
 * - Table head (thead) has a row (#categories).
 *   For each category, you should create a cell element (th) and append that to it.
 * - Table body (tbody) has a row (#clues).
 *   For each category, you should create a cell element (td) and append that to it.
 *   Besides, for each clue in a category, you should create a row element (tr) and append it to the corresponding previously created and appended cell element (td).
 * - To this row elements (tr) should add an event listener (handled by the `handleClickOfClue` function) and set their IDs with category and clue IDs. This will enable you to detect which clue is clicked.
 */
function fillTable(categories) {
  $("#categories").empty();
  $("#clues").empty();
  $("#active-clue").empty();
  const categoriesRow = document.getElementById('categories');
  const cluesRow = document.getElementById('clues');

  for (let i = 0; i < categories.length; i++) {//for each category in the categories
    const th = document.createElement('th');
    const td = document.createElement('td');
    th.textContent = categories[i].title;//set the category title
    categoriesRow.appendChild(th);//append the category to the row

    for (let j = 0; j < categories[i].clues.length; j++) {//for each clue in the category
      const clueElement = document.createElement('tr');
      clueElement.classList.add('clue');
      clueElement.textContent = categories[i].clues[j].value || (j + 1) * 100;//set the value of the clue
      clueElement.id = `${categories[i].id}-${categories[i].clues[j].id}`;
      clueElement.addEventListener('click', handleClickOfClue);

      td.appendChild(clueElement); //add the clue to the column
    }

    cluesRow.appendChild(td);//add the column to the row
  }
}

$(".clue").on("click", handleClickOfClue);

/**
 * Manages the behavior when a clue is clicked.
 * Displays the question if there is no active question.
 *
 * Hints:
 * - Control the behavior using the `activeClueMode` variable.
 * - Identify the category and clue IDs using the clicked element's ID.
 * - Remove the clicked clue from categories since each clue should be clickable only once. Don't forget to remove the category if all the clues are removed.
 * - Don't forget to update the `activeClueMode` variable.
 *
 */
function handleClickOfClue(event) {
  if (activeClueMode !== 0) return;

  if ($(event.target).hasClass("viewed")) {
    console.warn("This clue has already been viewed 😅");
    return;
  }
  // todo find and remove the clue from the categories
  const [categoryId, clueId] = event.target.id.split("-").map(Number);//get the id from the clicked element and convert them to numbers with map(Number) because we have it as string in the fillTable function.

  let category = categories.find(category => category.id === categoryId);
  let clue = category.clues.find(clue => clue.id === clueId);
  //remove the clue from the category
  category.clues = category.clues.filter(clue => clue.id !== clueId);
  //remove the category if all clues are removed
  if (category.clues.length === 0) {
    categories = categories.filter(category => category.id !== categoryId);
  }
  //console log removed clue
  console.log(clue);
  // todo mark clue as viewed (you can use the class in style.css), display the question at #active-clue
  $(event.target).addClass("viewed");
  $("#active-clue").html(clue.question);//display the question
  activeClue = clue;
  activeClueMode = 1;
  activeClueElement.classList.add('clue');//styling
}

$("#active-clue").on("click", handleClickOfActiveClue);

/**
 * Manages the behavior when a displayed question or answer is clicked.
 * Displays the answer if currently displaying a question.
 * Clears if currently displaying an answer.
 *
 * Hints:
 * - Control the behavior using the `activeClueMode` variable.
 * - After clearing, check the categories array to see if it is empty to decide to end the game.
 * - Don't forget to update the `activeClueMode` variable.
 */
function handleClickOfActiveClue(event) {
  // todo display answer if displaying a question

  // todo clear if displaying an answer
  // todo after clear end the game when no clues are left

  if (activeClueMode === 1) {
    activeClueMode = 2;
    activeClueElement.classList.remove('clue');//styling
    activeClueElement.classList.add('answer');//styling
    $("#active-clue").html(activeClue.answer);
  }
  else if (activeClueMode === 2) {
    activeClueMode = 0;
    activeClueElement.classList.remove('answer');//styling
    $("#active-clue").html(null);

    if (categories.length === 0) {
      isPlayButtonClickable = true;
      $("#play").text("Restart the Game!");
      $("#active-clue").html("The End!");
    }
  }
}

//Working Further with the API
// Before you begin the project, explore the API. What happens when you limit the responses in the first URL? (i.e 'count=5') or if you try to GET a Category which does NOT exist (i.e "id=0").
//Answer: If I limit it to 5 I get the first 5 categories. If I try to get a category that doesn't exist I get an error (in promise) AxiosError