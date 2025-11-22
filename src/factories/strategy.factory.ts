import {
  MessageStrategy,
  TextMessageStrategy,
  ImageMessageStrategy,
} from "../strategies";

export class StrategyFactory {
  public static createStrategy(type: "text" | "image" | ""): MessageStrategy {
    switch (type) {
      case "text":
        return new TextMessageStrategy();
      case "image":
        return new ImageMessageStrategy();
      default:
        return new TextMessageStrategy();
    }
  }
}
