
#include "../Simple-Web-Server/server_http.hpp"
#include <future>

// Added for the json-example
#define BOOST_SPIRIT_THREADSAFE

#include <boost/property_tree/json_parser.hpp>
#include <boost/property_tree/ptree.hpp>

// Added for the default_resource example
#include <algorithm>
#include <boost/filesystem.hpp>
#include <fstream>
#include <vector>

#ifdef HAVE_OPENSSL
#include "crypto.hpp"
#endif

using namespace std;
// Added for the json-example:
using namespace boost::property_tree;
#include   "Training.h"
#include <nlohmann/json.hpp>

// for convenience
using json = nlohmann::json;

#include "config.h"

#include <boost/program_options.hpp>
#include <memory>
#include <string>
#include "LeelaHelper.h"
#include "GTP.h"

using namespace Utils;

using HttpServer = SimpleWeb::Server<SimpleWeb::HTTP>;

int main(int argc, char *argv[]) {
  HttpServer server;
  server.config.port = 1999;
  std::cerr<<"aq 0"<<std::endl;
  server.resource["^/json$"]["POST"] = [argc, argv](shared_ptr<HttpServer::Response> response,
                                                    shared_ptr<HttpServer::Request> request) {
    std::cerr<<"aq 1"<<std::endl;
      static auto game = init(argc, argv);
      std::cerr<<"aq 3"<<std::endl;
      Training::clear_training();
      game->reset_game();
      std::cerr<<"aq 4"<<std::endl;

      try {
        auto j3 = json::parse(request->content);
        for (const auto &move : j3.at("moves")) {
          const auto x = move.at("x").get<int>();
          const auto y = move.at("y").get<int>();
          const auto isBlack = move.at("isBlack").get<int>();

          const auto vertex = game->board.get_vertex(x, y);
          game->play_move((int) !isBlack, vertex);
        }
        const auto commandSpec = j3.at("commandSpec");
        const auto command = commandSpec.at("command").get<string>();
        if(true) // command ===
        {
          GTP::execute(*game, "genmove " +  (game->board.black_to_move() ? string("b") : string("w")));
        }
        const auto [x,y]  = game->board.get_xy(game->get_last_move());
        const auto answer = json({"move", {{"x", x}, {"y", y}}}).dump();

        response->write(answer);
      }
      catch (const exception &e) {
        response->write(SimpleWeb::StatusCode::client_error_bad_request, e.what());
      }
  };
  promise<unsigned short> server_port;
  thread server_thread([&server, &server_port]() {
      // Start server
      server.start([&server_port](unsigned short port) {
          server_port.set_value(port);
      });
  });
  server_thread.join();

  return 0;

}
