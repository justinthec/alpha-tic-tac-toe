# AlphaTicTacToe

######The younger brother of the well known AlphaGo, AlphaTicTacToe is the undisputed world champion of Tic Tac Toe with 0 career losses.

*AlphaTicTacToe* builds a **solved game tree** for tic tac toe and uses it play against a human.
![image](http://i.imgur.com/0JVIYtZ.png)
![image](http://i.imgur.com/sja0CtG.png)

>Think you have what it takes to take on the champion?
**http://jchan.me/alpha-tic-tac-toe**

## Something cool I learned: Implementing Recursion with a loop and 2 stacks
Tasked with building a tree, I instinctively looked to write a recursive function due to the corresponding nature of branching trees and making multiple recursive calls, one for each branch.

With this in mind I wrote the first version of `buildTree` as a recursive function which followed the typical outline:

**1. Base case:** `return` some literal value. (In this case an object containing the finished board, with a winner declared).

Example: 
```javascript
return {
  board: [1,1,1,
          2,2,1,
          2,1,2],
  winner: 1 // Player 1
};
```
**2. Complex (Recursive) case:** For each child that is required for this node, recurse and add the resulting child to our node. (In this case `buildTree` is called for each possible next move in the game from the current board).

Example:
   ```javascript
// node contains the board [1,1,0,
//                          2,1,2,
//                          2,0,0]
for each move in node.board {
  node.move = buildTree(makeMove(node.board, move));
}
// This results in 3 recursive calls to buildTree:
// [1,1,1,   [1,1,0,   [1,1,0,
//  2,1,2,    2,1,2,    2,1,2,
//  2,0,0]    2,1,0]    2,0,1]
```
Note that after each child is returned we need to add it to the parent. (The importance of this comes in to play later).

#### Why we can't use recursion
When I tried to run the `buildTree` function to generate all possible tic tac toe moves however, I got this:

![image](http://i.imgur.com/4bTNV4Z.png)

It turns out that there are `9! == 362880` possible tic tac toe boards and that number exceeds well beyond the stack limits of any modern browser, the closest being Firefox at `50994` in 2014. Therefore we either have to wait for the limit to go up or we implement our tree generation without recursion.

#### Solution
So how do we immitate recursion using a loop?
* Well we're going to need 1 stack for sure to contain our inputs (each instance of a would-be recursive call). Let's call this the `inputStack`
   * The `inputStack` will start off containing only one element: the rootNode of our desired tree. (In the case of tic tac toe, the rootNode represents the empty game board `[0,0,0,0,0,0,0,0,0]`).
   * In the **Recursive case**, we will keep our current node on the `inputStack` and add one new node for each time we would have made a recursive call to generate a child node. (In this case, we will push each possible next move to the `inputStack`. The `inputStack` would look something like: `[{board: [0,0,...,0]}, {board: [1,0,...,0]}, {board: [0,1,...,0]}, ... , {board: [0,0,...,1]}]`.
   * Therefore each node will spawn `n` child nodes immediately above itself on the stack and then each of those will in turn spawn their child nodes on top of the stack.
* What's our **Base case**?
   *  Our base case is when we reach a terminal child (a leaf in the tree with no children).
   *  This terminal child will not add any new inputs to the `inputStack`, is not waiting to receive any children, and is therefore finished. We need to start working on the next node on the stack but we cannot reach it since our current terminal node is at the top. Can we just pop this terminal node off the `inputStack`? **No!** if we do, the data will be lost and we don't have our parent node to save it to since the parent node is an uncertain distance below our current position on the `inputStack`.
   *  In order to save the terminal child node or any other **finished** node, we pop it off the `inputStack` and instead push it to a new stack called the `finishedStack` which holds all children that are ready to be added to their respective parents.
      * The `finishedStack` will hold the children in order from the top since the top of the stack points to *the last child that was finished*, which would have been *the first child pushed onto the `inputStack`*. This is because the children are pushed onto the `inputStack` in order, therefore the top of the `inputStack` points to the last child and the first child is last to be processed/finished.
      * Now that we have the 2 stacks set up, it is a fairly straightforward process of moving these nodes from the `inputStack` to the `finishedStack` when they are finished, and then once the parent reaches the top of the `inputStack`, you pop off the children it has been waiting for from the `finishedStack` (already in order), and add them to the parent node. Now that it has all of its children, it is now a **finished** node and should be popped off the `inputStack` and pushed onto the `finishedStack` to wait for its own parent, and so on.

Here is the pseudocode for completeness:
```javascript
var inputStack = [rootNode];
var finishedStack = [];

while (currentNode = inputStack.pop()) {
  if (number of expectedChildren(currentNode) == 0) { // Base Case: Terminal child node
    finishedStack.push(currentNode);
  } else if (currentNode.waitingForChildren?) { // Base Case: Finish a parent node waiting for children
    for (var i = 0; i < number of expectedChildren(currentNode); i++) {
      currentNode.children.add(finishedStack.pop());
    }
    finishedStack.push(currentNode);
  } else { // Recursive Case: Create and push child nodes to be processed onto the inputStack
    currentNode.waitingForChildren? = true;
    inputStack.push(currentNode); // Put the parent back on the stack since it's not done yet.
    for each child in expectedChildren(currentNode) {
      inputStack.push(child);
    }
  }
}
// After the loop exits, you will have a single node containing the entire tree in the finishedStack.
```

#### Final note
After I realized that I couldn't use recursion, I was ready to just give up and use a different language but luckily I found a way to do it iteratively and the experience supports the fact that ALL recursive problems can be done iteratively.

Hopefully you learned something from this and thanks for reading!

>Justin
