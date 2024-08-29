// App.tsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import PlayerList from "./components/PlayerList";
import Player from "./components/Player";
import Roster from "./components/Roster";
import AuctionRoom from "./components/AuctionRoom";
import { RootStore } from "./stores/RootStore";
import { StoreProvider } from "./stores/StoreContext";
import AppInitializer from "./components/AppInitializer";
import { LoggedInGate } from "./components/SecurityComponents";
import Login from "./components/Login";
const rootStore = new RootStore();

const App: React.FC = () => {
	return (
		<StoreProvider store={rootStore}>
			<LoggedInGate FallbackComponent={Login}>
				<AppInitializer>
					<BrowserRouter>
						<div className="min-h-screen bg-gray-100 text-gray-900 font-sans">
							<Header />
							<main className="container mx-auto px-4 py-8">
								<Routes>
									<Route path="/" element={<Dashboard />} />
									<Route path="/players" element={<PlayerList />} />
									<Route path="/player/:playerId" element={<Player />} />
									<Route path="/roster/:teamId" element={<Roster />} />
									<Route path="/auction" element={<AuctionRoom />} />
								</Routes>
							</main>
						</div>
					</BrowserRouter>
				</AppInitializer>
			</LoggedInGate>
		</StoreProvider>
	);
};

export default App;
