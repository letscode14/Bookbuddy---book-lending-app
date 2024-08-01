import User from '../../entity/userEntity'

export class TrieNode {
  public children: { [key: string]: TrieNode } = {}
  public isEnd: boolean = false
  public users: Set<User> = new Set()
}

export class UserTrie {
  private root: TrieNode

  constructor() {
    this.root = new TrieNode()
  }

  insert(user: User): void {
    this.addUserToTrie(user.userName, user)
    this.addUserToTrie(user.name, user)
    this.printTrie(this.root)
  }
  printNode(): void {
    this.printTrie(this.root)
  }
  search(query: string): User[] {
    this.printTrie(this.root)
    const node = this.searchNode(query)
    if (node) {
      return Array.from(node.users)
    }
    return []
  }

  private addUserToTrie(word: string, user: User) {
    let node = this.root
    for (const char of word) {
      if (!node.children[char]) {
        node.children[char] = new TrieNode()
      }
      node = node.children[char]
    }
    node.isEnd = true
    node.users.add(user)
  }

  private searchNode(query: string): TrieNode | null {
    let node = this.root
    for (const char of query) {
      if (!node.children[char]) {
        return null
      }
      node = node.children[char]
    }
    return node
  }

  private printTrie(node: TrieNode, word: string = ''): void {
    if (node.isEnd) {
      console.log(`Word: ${word}, Users: ${Array.from(node.users)}`)
    }
    for (const char in node.children) {
      this.printTrie(node.children[char], word + char)
    }
  }
}
