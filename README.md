A tic-tac-toe game implemented through HTML, JavaScript and CSS. Key features:
1) Allows selecting between 1-player and 2-player modes.
2) Enables selection of first player's symbol (X or O), which would automatically determine the symbol to be used by the second player or computer.
3) The first move is always done by a player with the symbol 'X'.
4) The computer opponent is able to perform the following:

   (i) Detect when the player is about to win and block their winning move.

   (ii) Detect when it can potentially win in its turn and make its move accordingly.

   (iii) Try choosing the corners or the center, when available. However, if it first detects that the player is about to win, it will instead go for (i).

5) The game can be reset once a player wins or the match ends in a draw. JavaScript to detect a win or draw was written.
6) A button to toggle between light mode and dark mode, while saving the mode in the browser. Hence, even upon closing the window and re-opening the game, the saved mode is applied.
