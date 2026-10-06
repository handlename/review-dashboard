import { usePullRequests } from "../app/usePullRequests";
import { useSettings } from "../app/useSettings";
import { QueryBar } from "./QueryBar";
import { StatusBar } from "./StatusBar";
import { TokenForm } from "./TokenForm";

export function App() {
	const { token, saveToken } = useSettings();
	const { state, applyQuery } = usePullRequests(token);

	return (
		<>
			<header>
				<h1 tabIndex={-1}>review-dashboard</h1>
			</header>
			<main>
				{token === null ? (
					<TokenForm onSave={saveToken} />
				) : (
					<>
						<QueryBar query={state.query} onApply={applyQuery} />
						<StatusBar state={state} />
					</>
				)}
			</main>
		</>
	);
}
