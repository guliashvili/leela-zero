//
// Created by George Guliashvili on 21/03/2020.
//

#ifndef LEELAZ_LEELA_H
#define LEELAZ_LEELA_H

#include <memory>
#include <string>
#include "GameState.h"
extern std::string boardIdentifier;
std::unique_ptr<GameState> init(int argc, const char * const argv[]);
void leelaProcessNews(std::string line);
#endif //LEELAZ_LEELA_H
